# 类的基础

## 一个最简单的类
```zig
pub const Basic = struct {
    pub usingnamespace zoop.Fn(@This());
    mixin: zoop.Mixin(@This()),
}
```
一个最简单的类，需要使用两个 `zoop` 函数：
- [zoop.Fn](../reference/zoop#Fn): 为类引入所有:
  -  [基本方法](../reference/class)
  -  类通过自己 [Fn](../reference/principle#Fn) 函数定义的方法
  -  从父类继承的方法
- [zoop.Mixin](../reference/zoop#Mixin): 为类定义必须的 `mixin` 字段，该字段包含了类型接口信息和父类字段。字段名 `mixin` 是关键字，不能使用其它名字。字段不必是第一个字段。
:::tip 注意
`mixin` 字段是由 `zoop` 来维护的，所以用户不要去修改它。
:::

## 给类加点方法和字段
下面我们给 `Basic` 添加一个 `msg` 字段，和两个可继承方法 `getMsg()` 和 `print()`：
```zig:line-numbers {4,14-16,19-21}
pub const Basic = struct {
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
            struct {
                pub fn print(this: *T) void { 
                    std.debug.print("{s}\n", .{this.cast(Basic).msg});
                }
            },
        });
    }
}
```
类的方法分两种：
- 可继承方法：定义在 [Fn](../reference/principle#Fn) 函数中的方法，如上面的 `getMsg()`, `print()` 方法
- 不可继承方法：定义在 [Fn](../reference/principle#Fn) 函数外的方法，如上面的 `init()` 方法

如果你现在不理解第15行，可以提前看看 [类型转换](as-cast)。下面我们就详细说说方法和字段是怎样被子类选择性继承的。

## 类的继承
我们为类的继承引入了新的关键字 `extends`，如下就是一个继承了上面 `Basic` 的类 `SubClass` 的定义，同时又添加了一个可继承方法 `setMsg`。继承是通过高亮的那行实现的：
```zig{2}
pub const SubClass = struct {
    pub const extends = .{Basic};
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
为了便于理解，我们把上面这段代码经过 `comptime` 计算后展开的代码列出来，这里假设 `Basic` 类是定义在 `modname` 这个模块里面的：
```zig:line-numbers {8,16,20,24} 
pub const SubClass = struct {
    pub const extends = .{Basic};

    mixin: struct {
        deallocator: ?std.mem.Allocator = null,
        meta: ?MetaInfo = null,
        data: struct {
            modname_Basic: Basic,
        },
    },

    pub fn init(self: *SubClass, msg: []const u8) void {
        self.cast(Basic).init(msg);
    }

    pub fn print(this: *SubClass) void { 
        std.debug.print("{s}\n", .{this.cast(Basic).msg});
    }

    pub fn getMsg(this: *SubClass) []const u8 { 
        return this.cast(Basic).msg;
    }

    pub fn setMsg(this: *SubClass, msg: []const u8) void { 
        this.cast(Basic).msg = msg;
    }
}
```
- 第8行继承了 `Basic` 的字段，是通过 [zoop.Mixin](../reference/zoop#Mixin) 得来
- 第16行继承了 `Basic.print()` 方法，是通过 [zoop.Fn](../reference/zoop#Fn) 得来
- 第20行继承了 `Basic.getMsg()` 方法，是通过 [zoop.Fn](../reference/zoop#Fn) 得来
- 第24行展开了 `SubClass` 新加的方法 `setMsg()`，也是通过 [zoop.Fn](../reference/zoop#Fn) 得来
:::tip 注意
不支持菱形继承。比如下面代码，`B` 和 `C` 都继承了 `A`，所以 `Wrong` 不能同时继承 `B` 和 `C`：
```zig
pub const A = struct {...};
pub const B = struct { pub const extends = {A}; ...};
pub const C = struct { pub const extends = {A}; ...};

// compile error!
pub const Wrong = struct { pub const extends = .{B, C}; ...};
```
:::

## 对象的创建和销毁
有两种创建类对象的方法
- 堆上创建类的实例：通过类的 [new()](../reference/class#new) 方法
- 栈上创建类的实例：通过类的 [make()](../reference/class#make) 方法

堆上创建并初始化 `SubClass`：
```zig
var sub: *SubClass = try SubClass.new(allocator);
sub.init("Hello World");
```

栈上创建并初始化 `SubClass`:
```zig
var sub: SubClass = SubClass.make();
sub.initMixin();
sub.init("Hello World");
```
:::tip 注意
栈上创建的对象在创建后必需调用 [initMixin()](../reference/class#initMixin) 方法初始化 [Mixin](../reference/principle#Mixin) 数据，这是为了让 [rootptr](../reference/principle#term) 能指向栈上的对象，而这件事无法在 [make()](../reference/class#make) 中做到。
:::

无论堆上还是栈上的对象，销毁都是通过 [destroy()](../reference/class#destroy) 方法
```zig
var heap_sub: *SubClass = try SubClass.new(allocator);
sub.init("Hello World");

var stack_sub: SubClass = SubClass.make();
sub.initMixin();
sub.init("Hello World");

heap_sub.destroy();
stack_sub.destroy();
```
如果对象在销毁之前有需要处理的事 (析构函数)，可以通过定义一个不可继承方法 `deinit()` 来实现：
```zig
pub const SubClass = struct {
    ...

    pub fn deinit(self: *SubClass) void {
        // 销毁前的操作...
    }
}
```
[destroy()](../reference/class#destroy) 会按照从子到父顺序自动调用父类子类的所有 `deinit()` 方法。

:::tip 注意
- 堆上对象一定要调用 [destroy()](../reference/class#destroy)，否则会有内存泄漏。栈上对象如果需要保证 `deinit()` 被调用，也需要调用 [destroy()](../reference/class#destroy)。
- 不要在类的 `deinit()` 方法中破坏 `mixin` 数据，比如 `self.* = undefined`，因为子类的 `mixin`中包含父类所有字段。
:::