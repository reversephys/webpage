# Overcoming Fuzzing Obstacles

Codebases often contain anti-fuzzing patterns that prevent effective coverage. Checksums, global state (like time-seeded PRNGs), and validation checks can block the fuzzer from exploring deeper code paths. This technique shows how to patch your System Under Test (SUT) to bypass these obstacles during fuzzing while preserving production behavior.

## Overview
Many real-world programs were not designed with fuzzing in mind. They may:
- Verify checksums or cryptographic hashes before processing input
- Rely on global state (e.g., system time, environment variables)
- Use non-deterministic random number generators
- Perform complex validation that makes it difficult for the fuzzer to generate valid inputs

These patterns make fuzzing difficult because:
1. Checksums: The fuzzer must guess correct hash values (astronomically unlikely)
2. Global state: Same input produces different behavior across runs (breaks determinism)
3. Complex validation: The fuzzer spends effort hitting validation failures instead of exploring deeper code

The solution is conditional compilation: modify code behavior during fuzzing builds while keeping production code unchanged.

## When to Apply
Apply this technique when:
- The fuzzer gets stuck at checksum or hash verification
- Coverage reports show large blocks of unreachable code behind validation
- Code uses time-based seeds or other non-deterministic global state
- Complex validation makes it nearly impossible to generate valid inputs
- You see the fuzzer repeatedly hitting the same validation failures

Skip this technique when:
- The obstacle can be overcome with a good seed corpus or dictionary
- The validation is simple enough for the fuzzer to learn (e.g., magic bytes)
- You're doing grammar-based or structure-aware fuzzing that handles validation
- Skipping the check would introduce too many false positives
- The code is already fuzzing-friendly

## Quick Reference
```c
#ifdef FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION
```

```rust
cfg!(fuzzing)
```

```c
#ifndef FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION
  return -1;
#endif
```

```rust
if !cfg!(fuzzing) {
  return Err(...)
}
```

## Step-by-Step

### Step 1: Identify the Obstacle
Run the fuzzer and analyze coverage to find code that's unreachable. Common patterns:
1. Look for checksum/hash verification before deeper processing
2. Check for calls to `rand()`, `time()`, or `srand()` with system seeds
3. Find validation functions that reject most inputs
4. Identify global state initialization that differs across runs

Tools to help:
- Coverage reports (see coverage-analysis technique)
- Profiling with `-fprofile-instr-generate`
- Manual code inspection of entry points

### Step 2: Add Conditional Compilation
Modify the obstacle to bypass it during fuzzing builds.

C/C++ Example:
```c
// Before: Hard obstacle
if (checksum != expected_hash) {
  return -1; // Fuzzer never gets past here
}

// After: Conditional bypass
if (checksum != expected_hash) {
  #ifndef FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION
  return -1; // Only enforced in production
  #endif
}
// Fuzzer can now explore code beyond this check
```

Rust Example:
```rust
// Before: Hard obstacle
if checksum != expected_hash {
  return Err(MyError::Hash); // Fuzzer never gets past here
}

// After: Conditional bypass
if checksum != expected_hash {
  if !cfg!(fuzzing) {
    return Err(MyError::Hash); // Only enforced in production
  }
}
// Fuzzer can now explore code beyond this check
```

### Step 3: Verify Coverage Improvement
After patching:
1. Rebuild with fuzzing instrumentation
2. Run the fuzzer for a short time
3. Compare coverage to the unpatched version
4. Confirm new code paths are being explored

### Step 4: Assess False Positive Risk
Consider whether skipping the check introduces impossible program states:
- Does code after the check assume validated properties?
- Could skipping validation cause crashes that cannot occur in production?
- Is there implicit state dependency?
If false positives are likely, consider a more targeted patch (see Common Patterns below).

## Common Patterns

### Pattern: Bypass Checksum Validation
Use Case: Hash/checksum blocks all fuzzer progress

Before:
```c
uint32_t computed = hash_function(data, size);
if (computed != expected_checksum) {
  return ERROR_INVALID_HASH;
}
process_data(data, size);
```

After:
```c
uint32_t computed = hash_function(data, size);
if (computed != expected_checksum) {
  #ifndef FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION
  return ERROR_INVALID_HASH;
  #endif
}
process_data(data, size);
```
False positive risk: **LOW** - If data processing doesn't depend on checksum correctness

### Pattern: Deterministic PRNG Seeding
Use Case: Non-deterministic random state prevents reproducibility

Before:
```c
void initialize() {
  srand(time(NULL)); // Different seed each run
}
```

After:
```c
void initialize() {
  #ifdef FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION
  srand(12345); // Fixed seed for fuzzing
  #else
  srand(time(NULL));
  #endif
}
```
False positive risk: **LOW** - Fuzzer can explore all code paths with fixed seed

### Pattern: Careful Validation Skip
Use Case: Validation must be skipped but downstream code has assumptions

Before (Dangerous):
```c
#ifndef FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION
if (!validate_config(&config)) {
  return -1; // Ensures config.x != 0
}
#endif
int32_t result = 100 / config.x; // CRASH: Division by zero in fuzzing!
```

After (Safe):
```c
#ifndef FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION
if (!validate_config(&config)) {
  return -1;
}
#else
// During fuzzing, use safe defaults for failed validation
if (!validate_config(&config)) {
  config.x = 1; // Prevent division by zero
  config.y = 1;
}
#endif
int32_t result = 100 / config.x; // Safe in both builds
```
False positive risk: **MITIGATED** - Provides safe defaults instead of skipping

### Pattern: Bypass Complex Format Validation
Use Case: Multi-step validation makes valid input generation nearly impossible

Rust Example:
```rust
// Before: Multiple validation stages
pub fn parse_message(data: &[u8]) -> Result<Message, Error> {
    validate_magic_bytes(data)?;
    validate_structure(data)?;
    validate_checksums(data)?;
    validate_crypto_signature(data)?;
    deserialize_message(data)
}

// After: Skip expensive validation during fuzzing
pub fn parse_message(data: &[u8]) -> Result<Message, Error> {
    validate_magic_bytes(data)?; // Keep cheap checks
    if !cfg!(fuzzing) {
        validate_structure(data)?;
        validate_checksums(data)?;
        validate_crypto_signature(data)?;
    }
    deserialize_message(data)
}
```
False positive risk: **MEDIUM** - Deserialization must handle malformed data gracefully

## Advanced Usage

### Real-World Examples
**OpenSSL**: Uses `FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION` to modify cryptographic algorithm behavior. For example, in [crypto/cmp/cmp_vfy.c](https://github.com/openssl/openssl/blob/afb19f07aecc84998eeea56c4d65f5e0499abb5a/crypto/cmp/cmp_vfy.c#L665-L678), certain signature checks are relaxed during fuzzing to allow deeper exploration of certificate validation logic.

**ogg crate (Rust)**: Uses `cfg!(fuzzing)` to [skip checksum verification](https://github.com/RustAudio/ogg/blob/5ee8316e6e907c24f6d7ec4b3a0ed6a6ce854cc1/src/reading.rs#L298-L300) during fuzzing. This allows the fuzzer to explore audio processing code without spending effort guessing correct checksums.

### Measuring Patch Effectiveness
After applying patches, quantify the improvement:
1. Line coverage: Use `llvm-cov` or `cargo-cov` to see new reachable lines
2. Basic block coverage: More fine-grained than line coverage
3. Function coverage: How many more functions are now reachable?
4. Corpus size: Does the fuzzer generate more diverse inputs?

Effective patches typically increase coverage by 10-50% or more.

### Combining with Other Techniques
Obstacle patching works well with:
- **Corpus seeding**: Provide valid inputs that get past initial parsing
- **Dictionaries**: Help fuzzer learn magic bytes and common values
- **Structure-aware fuzzing**: Use protobuf or grammar definitions for complex formats
- **Harness improvements**: Better harness can sometimes avoid obstacles entirely

## Tool-Specific Guidance

### libFuzzer
libFuzzer automatically defines `FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION` during compilation.

```bash
# C++ compilation
clang++ -g -fsanitize=fuzzer,address -DFUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION \
    harness.cc target.cc -o fuzzer
# The macro is usually defined automatically by -fsanitize=fuzzer
```

Integration tips:
- The macro is defined automatically; manual definition is usually unnecessary
- Use `#ifdef` to check for the macro
- Combine with sanitizers to detect bugs in newly reachable code

### AFL++
AFL++ also defines `FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION` when using its compiler wrappers.

```bash
# Compilation with AFL++ wrappers
afl-clang-fast++ -g -fsanitize=address target.cc harness.cc -o fuzzer
# The macro is defined automatically by afl-clang-fast
```

Integration tips:
- Use `afl-clang-fast` or `afl-clang-lto` for automatic macro definition
- Persistent mode harnesses benefit most from obstacle patching
- Consider using `AFL_LLVM_LAF_ALL` for additional input-to-state transformations

### honggfuzz
honggfuzz also supports the macro when building targets.

```bash
# Compilation
hfuzz-clang++ -g -fsanitize=address target.cc harness.cc -o fuzzer
```

Integration tips:
- Use `hfuzz-clang` or `hfuzz-clang++` wrappers
- The macro is available for conditional compilation
- Combine with honggfuzz's feedback-driven fuzzing

### cargo-fuzz (Rust)
cargo-fuzz automatically sets the `fuzzing` cfg option during builds.

```bash
# Build fuzz target (cfg!(fuzzing) is automatically set)
cargo fuzz build fuzz_target_name

# Run fuzz target
cargo fuzz run fuzz_target_name
```

Integration tips:
- Use `cfg!(fuzzing)` for runtime checks in production builds
- Use `#[cfg(fuzzing)]` for compile-time conditional compilation
- The `fuzzing` cfg is only set during `cargo fuzz` builds, not regular `cargo build`
- Can be manually enabled with `RUSTFLAGS="--cfg fuzzing"` for testing

### LibAFL
LibAFL supports the C/C++ macro for targets written in C/C++.

```bash
# Compilation
clang++ -g -fsanitize=address -DFUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION \
    target.cc -c -o target.o
```

Integration tips:
- Define the macro manually or use compiler flags
- Works the same as with libFuzzer
- Useful when building custom LibAFL-based fuzzers

## Related Skills

### Tools That Use This Technique
- `FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION`
- `cfg!(fuzzing)`

## Resources

### Key External Resources
- [OpenSSL Fuzzing Documentation](https://github.com/openssl/openssl/tree/master/fuzz)
- [LibFuzzer Documentation on Flags](https://llvm.org/docs/LibFuzzer.html)
- [Rust cfg Attribute Reference](https://doc.rust-lang.org/reference/conditional-compilation.html)
- [trailofbits/skills](https://github.com/trailofbits/skills)
