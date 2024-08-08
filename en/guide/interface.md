# Interface Basics
The essence of an interface is a fat pointer.

## A simplest interface
The following is an interface `IBasic` that defines an interface method `getMsg()`:
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
- `Vtable`, `ptr`, `vptr`, `Api` are all newly introduced keywords
- Lines 2-4 define the `Vtable` keyword of the interface through [zoop.DefVtable](../reference/zoop#DefVtable) , and the `Vtable` type contains fields for all interface methods
- Line 5, introduce the parent interface and all [ApiMethod](../reference/principle#term) defined in [Api](../reference/principle#Api) through [zoop.Api](../reference/zoop#Api)
- Lines 7-8, fat pointer data
- Lines 10-15 define the `getMsg()` [ApiMethod](../reference/principle#term) through [Api](../reference/principle#Api)

:::tip Note
All interfaces automatically inherit the [zoop.IObject](../reference/iobject) interface
:::

## Default implementation of the interface
When a method of an interface has the same implementation most of the time, you can specify a default implementation directly when defining the interface. For example, if `IBasic.getMsg()` returns "Hello" most of the time, we can define `IBasic` like this:
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
In this way, all classes that declare to implement the `IBasic` interface do not need to implement their own version of the `getMsg()` method if they accept the default implementation of `getMsg()` in the interface definition.

## Interface inheritance
Interface inheritance uses the same keyword `extends` as class inheritance. Below we define a new interface `ISubClass` that inherits `IBasic` and add a new [ApiMethod](../reference/principle#term) named `setMsg()` to the new interface:
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
To make it easier to understand, we list the code expanded after the above code is calculated by `comptime`:
```zig
pun const ISubClass = struct {
    pub const extends = .{IBasic};
    pub const Vtable = struct {
        ...// Omit fields from zoop.IObject
        getMsg: *const fn (*anyopaque) []const u8 = &IBasic._getMsg,
        setMsg: *const fn (*anyopaque, msg: []const u8) void,
    });

    ptr: *anyopaque,
    vptr: *Vtable,

    ...// Omit functions from zoop.IObject

    pub fn getMsg(self: ISubClass) []const u8 {
        return self.vptr.getMsg(self.ptr);
    }

    pub fn setMsg(self: ISubClass, msg: []const u8) void {
        self.vptr.setMsg(self.ptr, msg);
    }
}
```
- The extra fields in `ISubClass.Vtable` are calculated from [zoop.DefVtable](../reference/zoop#DefVtable)
- `ISubClass.getMsg` method, from [zoop.Api](../reference/zoop#Api) calculation
:::tip Note
There cannot be methods with the same name in all interface methods of an interface and all its parent interfaces, otherwise a compilation error will occur.
:::

## Interface Implementation
The class implements the interface using the same keyword `extends` as inheritance. Below we define a class `Basic` that implements the `IBasic` interface:
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
- Line 2, implement the `IBasic` interface through the `extends` keyword declaration
- Lines 12-20 define the `getMsg()` method required to implement `IBasic`
:::tip Note
- The interface method must be inheritable, that is, the method must be defined in [Fn](../reference/principle#Fn)
- If an interface method is not implemented and no default implementation is defined in the interface, a compilation error will occur
- If any inheritable method of a class (including those inherited from parent classes) has the same name as a method in an interface but with different parameters/return values, there will be a compilation error (except for the first parameter, which is the `this` pointer)
- If the parent class has an inheritable method that matches a method definition in the interface, this class does not need to implement the method, and the interface will use the parent class version of the implementation
- The subclass automatically inherits and implements all interfaces implemented by the parent class
- All classes automatically implement the [zoop.IObject](../reference/iobject) interface
:::

## Inheriting and implementing interfaces
Inheriting a class and implementing an interface can be done at the same time. Below is a class called `SubClass` that inherits `Basic` and implements the `ISubClass` interface:
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
- In line 2, the `extends` keyword is used to inherit `Basic` and declare the implementation of `ISubClass`
- Line 8, call the parent class `Basic.init()` to initialize
- Line 14, implement the `ISubClass.setMsg()` interface method
:::tip Note
`SubClass` is dependent on the inherited `Basic.getMsg()` and implements the `ISubClass.getMsg()` interface method
:::
