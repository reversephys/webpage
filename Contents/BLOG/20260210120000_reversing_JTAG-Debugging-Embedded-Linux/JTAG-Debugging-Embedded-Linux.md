# JTAG Debugging on Embedded Linux Devices

## Introduction

JTAG (Joint Test Action Group) is one of the most powerful interfaces available to hardware security researchers. Originally designed for testing printed circuit boards, it has become an essential tool for debugging and reverse engineering embedded systems.

In this post, we walk through the process of identifying JTAG pins on an unknown target board, connecting a debug adapter, and gaining interactive shell access to a live embedded Linux device.

## Identifying JTAG Pins

The first step in any JTAG engagement is locating the test points on the PCB. Manufacturers sometimes label them — TDI, TDO, TMS, TCK, and TRST — but more often they are left as unlabeled pads or hidden under components.

We used a combination of visual inspection and continuity testing with a multimeter. Look for clusters of 10 or 20 pin headers, or rows of unpopulated pads near the main SoC. In our case, we found a 14-pin header near the edge of the board.

![JTAG Setup](images/jtag_setup.png)

To confirm the pinout, we used the JTAGulator — a dedicated tool that automates pin identification by trying all possible combinations. Within minutes, it identified TDI, TDO, TMS, and TCK.

## Connecting the Debug Adapter

With the pinout confirmed, we wired up an FT2232H-based JTAG adapter. The FT2232H is a popular choice because of its flexibility and broad software support. We connected:

- **TCK** → Pin 1
- **TMS** → Pin 3 
- **TDI** → Pin 5
- **TDO** → Pin 7
- **GND** → Pin 14

Using OpenOCD (Open On-Chip Debugger), we configured a target file matching the SoC on the board — in this case, an ARM Cortex-A7 based processor.

```bash
openocd -f interface/ftdi/ft2232h-module-swd.cfg -f target/cortex_a.cfg
```

## Gaining Shell Access

Once OpenOCD established a connection, we could halt the CPU, inspect memory, and set breakpoints. But the real prize was leveraging the debug interface to access the Linux kernel's memory space.

By locating the kernel's `init_task` structure in memory, we traversed the task list to find running processes. From there, we patched the authentication check in the login binary, allowing us to gain root shell access without credentials.

## Key Takeaways

- Always look for unexposed debug headers on target PCBs
- JTAGulator dramatically speeds up pin identification
- OpenOCD provides a powerful, scriptable interface for JTAG debugging
- With JTAG access, virtually all software security measures can be bypassed

## Conclusion

JTAG remains one of the most reliable attack surfaces on embedded devices. While some manufacturers implement JTAG lockout mechanisms, many consumer and industrial devices still ship with fully accessible debug interfaces. Understanding how to leverage these interfaces is a fundamental skill for any hardware security researcher.
