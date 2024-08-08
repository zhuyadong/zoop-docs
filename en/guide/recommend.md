# Recommendations
## Naming conventions
All of the following conventions are based on the [Zig Style Guide](https://ziglang.org/documentation/0.13.0/#Style-Guide).
- Interface names start with `I` followed by camel case. For example, `ISomeInterface`
- Among the inheritable methods, the method names used to implement the interface are the same as the [Zig Style Guide](https://ziglang.org/documentation/0.13.0/#Style-Guide), and those that are not interface methods start with `_`. For example, `_notInterfaceMethod`
- The default implementation function of the interface, starting with `_`. For example, `_getMsg`
- The `self` pointer of an inheritable method is named `this`, while the `self` pointer of a non-inheritable method is still called `self`. The reason for this is that in an inheritable method, when you need to access the data and methods of the class you are in, you can still name the variable that is statically converted to the class you are in as `self`, such as:
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

## Performance Optimization
In `zoop`, virtual functions can only be called through interfaces, and converting objects to interfaces often requires [dynamic conversion](as-cast#as), which has overhead. To address this problem, the recommended solution is to save an interface containing all virtual functions in the most basic class inherited by the class. The following example illustrates this:
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
:::info Description
- The base interface `IBase` declares an interface method, or virtual function `getName()`
- The base class `Base` implements the `IBase` interface and provides an inheritable but non-virtual method `_print()`, which obtains the real name through the virtual method `getName()` and prints it. Note that `Base` itself does not provide a `getName()` method, so `Base` here is equivalent to the abstract base class in the OOP concept.
- Subclasses `SubOne` and `SubTwo` both implement their own `getName()` interface method, and call `Base.init()` in their own `init()` methods, so they both save their own interfaces converted to `IBase` in their own `Base.iface` fields.
:::
Therefore, when we call the `_print()` method on the `SubOne` and `SubTwo` objects (this method is inherited from `Base`), the implementation of `_print()` directly uses `Base.iface` to perform the virtual function call of `getName()`, which saves the [dynamic conversion](as-cast#as) overhead.
With this method, each object only needs to be [dynamically converted](as-cast#as) once when it is initialized. Thereafter, the use of the object will no longer incur this overhead, thus greatly reducing the overhead of virtual function calls.
