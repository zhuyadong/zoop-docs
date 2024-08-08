# Class Basics

## A simplest class
```zig
pub const Basic = struct {
    pub usingnamespace zoop.Fn(@This());
    mixin: zoop.Mixin(@This()),
}
```
A simplest class that needs to use two `zoop` functions:
- [zoop.Fn](../reference/zoop#Fn): Import all for the class:
- [Basic Method](../reference/class)
- Methods defined by the class through its own [Fn](../reference/principle#Fn) function
- Methods inherited from parent classes
- [zoop.Mixin](../reference/zoop#Mixin): Defines a required `mixin` field for the class, which contains type interface information and parent class fields. The field name `mixin` is a keyword, no other name can be used. The field does not have to be the first field.
:::tip Note
The `mixin` field is maintained by `zoop`, so users should not modify it.
:::

## Add methods and fields to the class
Next, we add a `msg` field to `Basic`, and two inherited methods `getMsg()` and `print()`:
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
There are two types of class methods:
- Inheritable methods: methods defined in the [Fn](../reference/principle#Fn) function, such as the `getMsg()` and `print()` methods above
- Non-inheritable methods: methods defined outside of a [Fn](../reference/principle#Fn) function, such as the `init()` method above

If you don't understand line 15 now, you can take a look at [Type Conversion](as-cast) in advance. Next, we will explain in detail how methods and fields are selectively inherited by subclasses.

## Class inheritance
We introduced a new keyword `extends` for class inheritance. The following is a definition of a class `SubClass` that inherits the above `Basic`, and adds an inheritable method `setMsg`. Inheritance is achieved through the highlighted line:
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
To make it easier to understand, we list the code above after the code is expanded by `comptime`, assuming that the `Basic` class is defined in the `modname` module:
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
- Line 8 inherits the fields of `Basic`, which is obtained through [zoop.Mixin](../reference/zoop#Mixin)
- Line 16 inherits the `Basic.print()` method, which is obtained through [zoop.Fn](../reference/zoop#Fn)
- Line 20 inherits the `Basic.getMsg()` method, which is obtained through [zoop.Fn](../reference/zoop#Fn)
- Line 24 expands the newly added method `setMsg()` of `SubClass`, which is also obtained through [zoop.Fn](../reference/zoop#Fn)
:::tip Note
Diamond inheritance is not supported. For example, in the following code, both `B` and `C` inherit from `A`, so `Wrong` cannot inherit from both `B` and `C`:
```zig
pub const A = struct {...};
pub const B = struct { pub const extends = {A}; ...};
pub const C = struct { pub const extends = {A}; ...};

// compile error!
pub const Wrong = struct { pub const extends = .{B, C}; ...};
```
:::

## Object creation and destruction
There are two ways to create class objects
- Create an instance of a class on the heap: through the class's [new()](../reference/class#new) method
- Create an instance of a class on the stack: through the class's [make()](../reference/class#make) method

Create and initialize `SubClass` on the heap:
```zig
var sub: *SubClass = try SubClass.new(allocator);
sub.init("Hello World");
```

Create and initialize `SubClass` on the stack:
```zig
var sub: SubClass = SubClass.make();
sub.initMixin();
sub.init("Hello World");
```
:::tip Note
Objects created on the stack must call the [initMixin()](../reference/class#initMixin) method to initialize the [Mixin](../reference/principle#Mixin) data after creation. This is to allow [rootptr](../reference/principle#term) to point to the object on the stack, which cannot be done in [make()](../reference/class#make).
:::

Whether objects are on the heap or on the stack, they are destroyed through the [destroy()](../reference/class#destroy) method
```zig
var heap_sub: *SubClass = try SubClass.new(allocator);
sub.init("Hello World");

var stack_sub: SubClass = SubClass.make();
sub.initMixin();
sub.init("Hello World");

heap_sub.destroy();
stack_sub.destroy();
```
If there is something that needs to be done before the object is destroyed (destructor), it can be implemented by defining a non-inheritable method `deinit()`:
```zig
pub const SubClass = struct {
    ...

    pub fn deinit(self: *SubClass) void {
        // Operations before destruction...
    }
}
```
[destroy()](../reference/class#destroy) will automatically call all `deinit()` methods of the parent class and its subclasses in order from child to parent.

:::tip Note
- Objects on the heap must call [destroy()](../reference/class#destroy), otherwise there will be memory leaks. Objects on the stack also need to call [destroy()](../reference/class#destroy) if they need to ensure that `deinit()` is called.
- Do not destroy `mixin` data in the class's `deinit()` method, such as `self.* = undefined`, because the subclass's `mixin` contains all the fields of the parent class.
:::
