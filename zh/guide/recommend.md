# 使用建议
## 命名规范
以下所有规范建立在 [Zig 风格指南](https://ziglang.org/documentation/0.13.0/#Style-Guide) 的基础上。
- 接口命名以 `I` 开头，后接驼峰命名。如 `ISomeInterface`
- 可继承方法中，用来实现接口的方法命名和 [Zig 风格指南](https://ziglang.org/documentation/0.13.0/#Style-Guide) 相同，不是接口方法的以 `_` 开头。如 `_notInterfaceMethod`
- 接口缺省实现函数，以 `_` 开头。如 `_getMsg`
- 可继承方法的 `self` 指针，命名为 `this`，不可继承方法的 `self` 指针，仍然叫 `self`。这样做的原因，是可继承方法中，需要访问所在类的数据和方法时，仍然可以把静态转换为所在类的变量命名为 `self`，如：
```zig
const Self = @This();
pub fn Fn(comptime T: type) type {
    return zoop.Method(.{
        struct {
            pub fn inheritableFunc(this: *T) void {
                var self = this.cast(Self);
                ...
            }
        }
    });
}
```

## 性能优化
`zoop` 中，对虚函数的调用只能通过接口进行，而把对象转成接口，常常需要进行 [动态转换](as-cast#as)，动态转换是有开销的。针对这个问题，建议方案是在类继承最基础的类中保存一个包含所有虚函数的接口，下面用例子说明：
```zig:line-numbers {28,31,38}
pub const IBase = struct {
    pub const Vtable = zoop.DefVtable(@This(), struct {
        getName: *const fn (*anyopaque) []const u8 = &_getName,
    });
    pub usingnamespace zoop.Api(@This());

    ptr: *anyopaque,
    vptr: *Vtable,

    fn _getName(_:*anyopaque) []const u8 {
        @panic("Not implemented.");
    }

    pub fn Api(comptime I: type) type {
        return struct {
            pub fn getName(self: I) []const u8 {
                return self.vptr.getName(self.ptr);
            }
        };
    }
}

pub const Base = struct {
    pub const extends = .{IBase};
    pub usingnamespace zoop.Fn(@This());

    mixin:zoop.Mixin(@This());
    iface: IBase,

    pub fn init(self: *Base) void {
        self.iface = self.as(IBase).?;
    }

    pub fn Fn(comptime T: type) type {
        return zoop.Method(.{
            struct {
                pub fn _print(this: *T) void {
                    const iface = this.cast(Base).iface;
                    std.debug.print("My name is:{s}\n", .{iface.getName()});
                }
            },
        });
    }
}

pub const SubOne = struct {
    pub const extends = .{Base};
    pub usingnamespace zoop.Fn(@This());

    mixin: zoop.Mixin(@This()),

    pub fn init(self: *SubOne) void {
        self.cast(Base).init();
    }

    pub fn Fn(comptime T: type) type {
        return zoop.Method(.{
            struct {
                pub fn getName(this: *T) []const u8 {
                    return "SubOne";
                }
            },
        });
    }
}

pub const SubTwo = struct {
    pub const extends = .{Base};
    pub usingnamespace zoop.Fn(@This());

    mixin: zoop.Mixin(@This()),

    pub fn init(self: *SubTwo) void {
        self.cast(Base).init();
    }

    pub fn Fn(comptime T: type) type {
        return zoop.Method(.{
            struct {
                pub fn getName(this: *T) []const u8 {
                    return "SubTwo";
                }
            },
        });
    }
}
```
:::info 说明
- 基本接口 `IBase` 申明了一个接口方法，或者叫虚函数 `getName()`
- 基类 `Base` 实现了 `IBase` 接口，并提供了一个可继承但非虚的方法 `_print()`，此方法通过虚方法 `getName()` 获得真实名并打印。注意到 `Base` 本身没有提供 `getName()` 方法，因此这里 `Base` 相当于 OOP 概念中的抽象基类。
- 子类 `SubOne` 和 `SubTwo` 都实现了自己的 `getName()` 接口方法，同时都在自己的 `init()` 方法中调用了 `Base.init()` 方法，因此都在自己的 `Base.iface` 字段中保存了自己转换为 `IBase` 后的接口。
:::
因此，当我们在 `SubOne` 和 `SubTwo` 对象上调用 `_print()` 方法的时候 (此方法继承自 `Base`)，因为 `_print()` 的实现中直接使用 `Base.iface` 来进行 `getName()` 的虚函数调用，这就节省了 [动态转换](as-cast#as) 开销。
通过这种方法，每个对象只有在初始化的时候，需要进行一次 [动态转换](as-cast#as)，之后对对象的使用将不再有这个开销，因此能极大的减少虚函数调用的开销。