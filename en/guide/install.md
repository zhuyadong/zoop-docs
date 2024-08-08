# Installation and Configuration

## Install
In the project root directory:
```shell
zig fetch "git+https://github.com/zhuyadong/zoop.git" --save=zoop
```
If you want to install a specific version:
```shell
zig fetch "git+https://github.com/zhuyadong/zoop.git#<ref id>" --save=zoop
```


## Configuration
In the project's build.zig:
```zig
    ...
    const zoop = b.dependency("zoop", .{
        .target = target,
        .optimize = optimize,
    });
    exe.root_module.addImport("zoop", zoop.module("zoop"));
    ...
```

## use
```zig
const zoop = @import("zoop");
```
