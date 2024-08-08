# 安装配置

## 安装
在项目根目录下：
```shell
zig fetch "git+https://github.com/zhuyadong/zoop.git" --save=zoop
```
如果要安装特定版本：
```shell
zig fetch "git+https://github.com/zhuyadong/zoop.git#<ref id>" --save=zoop
```


## 配置
在项目的 build.zig 中：
```zig
    ...
    const zoop = b.dependency("zoop", .{
        .target = target,
        .optimize = optimize,
    });
    exe.root_module.addImport("zoop", zoop.module("zoop"));
    ...
```

## 使用
```zig
const zoop = @import("zoop");
```