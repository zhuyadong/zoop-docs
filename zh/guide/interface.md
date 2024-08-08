# 接口基础
接口的本质就是一个胖指针。

## 一个最简单的接口
下面是定义了一个接口方法 `getMsg()` 的接口 `IBasic`：
```zig:line-numbers
pub const IBasic = struct {
    pub const Vtable = zoop.DefVtable(@This(), struct {
        getMsg: *const fn (*anyopaque) []const u8,
    });
    pub usingnamespace zoop.Api(@This());

    ptr: *anyopaque,
    vptr: *Vtable,

    pub fn Api(comptime I: type) type {
        return struct {
            pub fn getMsg(self: I) []const u8 {
                return self.vptr.getMsg(self.ptr);
            }
        };
    }
}
```
- `Vtable`, `ptr`, `vptr`, `Api` 都是新引入的关键字
- 第2-4行，通过 [zoop.DefVtable](../reference/zoop#DefVtable) 定义接口的 `Vtable` 关键字，`Vtable` 类型中包含所有接口方法的字段
- 第5行，通过 [zoop.Api](../reference/zoop#Api) 引入父接口和自己在 [Api](../reference/principle#Api) 中定义的所有 [ApiMethod](../reference/principle#term)
- 第7-8行，胖指针的数据
- 10-15行，通过 [Api](../reference/principle#Api) 定义了 `getMsg()` 这个 [ApiMethod](../reference/principle#term)

:::tip 注意
所有接口自动继承 [zoop.IObject](../reference/iobject) 接口
:::

## 接口的缺省实现
当出现接口的某个方法大部分时候的实现是一样的情况，可以在接口定义的时候直接指定一个缺省实现，比如 `IBasic.getMsg()` 如果大部分时候都返回 "Hello"，那我们可以这样定义 `IBasic`：
```zig{3,10-12}
pub const IBasic = struct {
    pub const Vtable = zoop.DefVtable(@This(), struct {
        getMsg: *const fn (*anyopaque) []const u8 = &_getMsg,
    });
    pub usingnamespace zoop.Api(@This());

    ptr: *anyopaque,
    vptr: *Vtable,

    fn _getMsg(_: *anyopaque) []const u8 {
        return "Hello";
    }

    pub fn Api(comptime I: type) type {
        return struct {
            pub fn getMsg(self: I) []const u8 {
                return self.vptr.getMsg(self.ptr);
            }
        };
    }
}
```
这样所有申明实现 `IBasic` 接口的类，如果认可接口定义中 `getMsg()` 的缺省实现，可以不实现自己版本的 `getMsg()` 方法。

## 接口的继承
接口的继承用的是和类的继承一样的关键字 `extends`，下面定义一个继承 `IBasic` 的新接口 `ISubClass`，并为新接口添加一个新的名为 `setMsg()` 的 [ApiMethod](../reference/principle#term)：
```zig:line-numbers {2}
pun const ISubClass = struct {
    pub const extends = .{IBasic};
    pub const Vtable = zoop.DefVtable(@This(), struct {
        setMsg: *const fn (*anyopaque, msg: []const u8) void,
    });
    pub usingnamespace zoop.Api(@This());

    ptr: *anyopaque,
    vptr: *Vtable,

    pub fn Api(comptime I: type) type {
        return struct {
            pub fn setMsg(self: I, msg: []const u8) void {
                self.vptr.setMsg(self.ptr, msg);
            }
        };
    }
}
```
为了便于理解，我们把上面这段代码经过 `comptime` 计算后展开的代码列出来：
```zig
pun const ISubClass = struct {
    pub const extends = .{IBasic};
    pub const Vtable = struct {
        ...// 省略来自 zoop.IObject 的字段
        getMsg: *const fn (*anyopaque) []const u8 = &IBasic._getMsg,
        setMsg: *const fn (*anyopaque, msg: []const u8) void,
    });

    ptr: *anyopaque,
    vptr: *Vtable,

    ...// 省略来自 zoop.IObject 的函数

    pub fn getMsg(self: ISubClass) []const u8 {
        return self.vptr.getMsg(self.ptr);
    }

    pub fn setMsg(self: ISubClass, msg: []const u8) void {
        self.vptr.setMsg(self.ptr, msg);
    }
}
```
- `ISubClass.Vtable` 中比定义时多出来的字段，来自 [zoop.DefVtable](../reference/zoop#DefVtable) 的计算
- `ISubClass.getMsg` 方法，来自 [zoop.Api](../reference/zoop#Api) 的计算
:::tip 注意
接口和其所有父接口的所有接口方法中，不能有同名方法出现，否则编译错误。
:::

## 接口的实现
类对接口的实现，使用和继承同样的关键字 `extends`。下面定义一个类 `Basic`，实现 `IBasic` 接口：
```zig:line-numbers {2,12-20}
pub const Basic = struct {
    pub const extends = .{IBasic};
    pub usingnamespace zoop.Fn(@This());

    msg: []const u8,
    mixin: zoop.Mixin(@This()),

    pub fn init(self: *Basic, msg: []const u8) void {
        self.msg = msg;
    }

    pub fn Fn(comptime T: type) type {
        return zoop.Method(.{
            struct {
                pub fn getMsg(this: *T) []const u8 { 
                    return this.cast(Basic).msg;
                }
            },
        });
    }
}
```
- 第2行，通过 `extends` 关键字申明实现 `IBasic` 接口
- 第12-20行，定义了实现 `IBasic` 必须的 `getMsg()` 方法
:::tip 注意
- 实现接口方法必须是可继承方法，也就是方法必须定义在 [Fn](../reference/principle#Fn) 中
- 如果接口有方法没有被实现，并且接口中没有定义缺省实现，则会出编译错误
- 如果类的所有可继承方法 (包括从父类继承来的) 中有和接口中方法同名但参数/返回值不同的情况，会有编译错误 (第一个参数例外，是 `this` 指针)
- 如果父类有可继承方法符合接口中某个方法定义，则本类可以不实现该方法，接口会使用父类版本的实现
- 子类自动继承并实现了父类实现的所有接口
- 所有类自动实现了 [zoop.IObject](../reference/iobject) 接口
:::

## 继承的同时实现接口
继承类和实现接口可以同时进行。下面定义一个类 `SubClass`，继承 `Basic` 同时实现 `ISubClass` 接口：
```zig:line-numbers {2,8,14}
pub const SubClass = struct {
    pub const extends = .{Basic, ISubClass};
    pub usingnamespace zoop.Fn(@This());

    mixin: zoop.Mixin(@This()),

    pub fn init(self: *SubClass, msg: []const u8) void {
        self.cast(Basic).init(msg);
    }

    pub fn Fn(comptime T: type) type {
        return zoop.Method(.{
            struct {
                pub fn setMsg(this: *T, msg: []const u8) void {
                    this.cast(Basic).msg = msg;
                }
            },
        });
    }
}
```
- 第2行，通过 `extends` 关键字，继承 `Basic` 的同时，申明实现 `ISubClass`
- 第8行，调用父类 `Basic.init()` 初始化
- 第14行，实现 `ISubClass.setMsg()` 接口方法
:::tip 注意
`SubClass` 是依赖继承的 `Basic.getMsg()` 实现了 `ISubClass.getMsg()` 接口方法
:::