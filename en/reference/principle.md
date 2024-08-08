---
outline: deep
---
# Terminology and Principles

## Term{#term}
- `fatptr`: a *zig struct* containing two pointers, one named *ptr* pointing to data, and one named *vptr* pointing to a list of functions
- `rootptr`: A pointer that always points to the original object during interface and type conversion
- `Class`: a *zig struct* that conforms to the *Class* specification defined by `zoop`
- `Method`: A function belonging to `Class` that can be inherited, overridden, and used to implement `Interface`
- `ApiMethod`: can be inherited by `Interface`, a glue function dedicated to accessing interface functions in `Vtable`, belonging to `Method` of `Interface`
- `Vtable`: contains the data type of all `Method` pointers of the `Class` to which the interface belongs
- `Interface`: a `fatptr` whose *ptr* points to `rootptr` and whose *vptr* points to its own `Vtable`
- [Mixin](#Mixin): The data type used in `Class` to store all parent class fields and type information
- [MixinData](#MixinData): [Mixin](#Mixin) is used to store the data type of all parent class fields
- [MetaInfo](#MetaInfo): Data type used by [Mixin](#Mixin) to store interface and type conversion information
- [TypeInfo](#TypeInfo): The data in [MetaInfo](#MetaInfo) that actually implements the interface and type conversion
- [DefVtable](#DefVtable): Function used to calculate `Vtable` type for `Interface`
- [Api](#Api): Functions implemented by `Interface` to calculate all `ApiMethod`s of itself
- [Fn](#Fn): A function implemented by `Class` that calculates all of its own `Method`

## Principle
### Mixin Design
First look at the key code in the `zoop.Mixin()` function:
```zig
pub fn Mixin(comptime T: type) type {
    return struct {
        deallocator: ?std.mem.Allocator = null,
        meta: ?MetaInfo = null,
        data: MixinData(T) = .{},
        ...
    }
}
```
:::info Description
- `deallocator`: If the class instance is allocated on the heap, this holds `allocator`; if it is allocated on the stack, this holds `null`
- `meta`: metadata, including information about types and interfaces and conversions between them, see [MetaInfo](#MetaInfo)
- `data`: save all parent class instance data, refer to [MixinData](#MixinData)
:::
---
### MixinData design
Assume that there are several class definitions in the module `mymod`:
```zig
pub const Base = struct {
    pub usingnamespace zoop.Fn(@This());
    mixin: zoop.Mixin(@This()),
};

pub const BaseTwo = struct {
    pub usingnamespace zoop.Fn(@This());
    mixin: zoop.Mixin(@This());
}

pub const Child = struct {
    pub const extends = .{Base, BaseTwo};
    pub usingnamespace zoop.Fn(@This());
    mixin: zoop.Mixin(@This());
}

pub const SubChild = struct {
    pub const extends = .{Child};
    pub usingnamespace zoop.Fn(@This());
    mixin: zoop.Mixin(@This());
}
```
Then the [MixinData](#MixinData) structure of all classes is as follows:
```zig
MixinData(Base) = struct {};

MixinData(BaseTwo) = struct {};

MixinData(Child) = struct {
    mymod_Base: Base,
    mymod_BaseTwo: BaseTwo,
}

MixinData(SubChild) = struct {
    mymod_Child: Child,
}
```
`MixData(T)` will determine what data is included in the returned *zig struct* based on the contents of `T.extends`.
In this way, a class can contain the data of all parent classes in an orderly manner.

---
### MetaInfo design {#MetaInfo}
[MetaInfo](#MetaInfo) supports the following type conversions:
- Transformations between any two points in the class hierarchy of `Class`
- Conversion between any two points in the interface inheritance tree of `Class`
- Conversion between any two points in the inheritance tree between the interface and the class of `Class`

Simply put, you can make any intuitive conversion between classes and interfaces.

Let’s first look at the key code of [MetaInfo](#MetaInfo):
```zig
pub const MetaInfo = packed struct {
    rootptr: ?*anyopaque = null,
    typeinfo: ?*const TypeInfo = null,
    ...
}
```
:::info Description
- `rootptr`: `rootptr` of all parent class data under `MixinData(T)` points to the real address of `T`
- `typeinfo`: type conversion information, see [TypeInfo](#TypeInfo) for details
:::
Because the `rootptr` in all parent class data in the class's [MixinData](#MixinData) points to the real class data, the original data can be found during the type conversion process, and then with the help of [TypeInfo](#TypeInfo), it can be freely converted in the interface and type tree. Let's see how [TypeInfo](#TypeInfo) performs interface and type conversion.

---
### Design of TypeInfo{#TypeInfo}
The structure of [TypeInfo](#TypeInfo) is as follows:
```zig
pub const VtableFunc = *const fn (ifacename: []const u8) ?*IObject.Vtable;
pub const SuperPtrFunc = *const fn (rootptr: *anyopaque, typename: []const u8) ?*anyopaque;
pub const TypeInfo = struct {
    typename: []const u8,
    getVtable: VtableFunc,
    getSuperPtr: SuperPtrFunc,
    ...
}
```
:::info Description
- typename: the type name of the object pointed to by `rootptr`
- getVtable: Given an interface name, return the function of the interface `Vtable`
- getSuperPtr: Given `rootptr` and a class name, returns a function that points to the class data pointer.
 
example:
```zig
const t = std.testing;
var o = try SubChild.new(t.allocator);
defer o.destroy();
const ptr1 = o.mixin.meta.?.typeinfo.?.getSuperPtr(o.mixin.meta.?.rootptr.?, @typeName(Base)).?;
const ptr2 = &o.mixin.data.mymod_Child.mixin.data.mymod_Base;
try t.expect(@intFromPtr(ptr1) == @intFromPtr(ptr2));

const iobj = o.as(zoop.IObject).?;
const vptr = o.mixin.meta.?.typeinfo.?.getVtable(@typeName(zoop.IObject)).?;
try t.expect(@intFromPtr(iobj.vptr) == @intFromPtr(vptr));
```
:::

---
### Principle of DefVtable{#DefVtable}
The declaration of [DefVtable](#DefVtable) is as follows:
```zig
pub fn DefVtable(comptime Iface: type, comptime APIs: type) type
```
Suppose there is the following `Interface` definition:
```zig{3-5}
pub const ISome = struct {
    pub const extends = .{IBase1, IBase2};
    pub const Vtable = zoop.DefVtable(ISome, struct {
        someFunc: *const fn(*anyopaque) void,
    });
}
```
The pseudo code for the highlighted part that actually works is as follows (assuming that *usingnamespace* can introduce *struct field*):
```zig
pub const Vtable = struct {
    pub usingnamespace IBase1.Vtable;
    pub usingnamespace IBase2.Vtable;
    someFunc: *const fn(*anyopaque) void,
}
```
---
### The principle of API
The declaration of [Api](#Api) is as follows:
```zig
pub fn Api(comptime I: type) type
```
If there is the following definition of `Interface`:
```zig
pub const IBase = struct {
    pub usingnamespace zoop.Api(@This());
    ...
    pub fn Api(comptime I: type) type {
        return struct {
            pub fn baseFunc1(self: I) void { _ = self; }
            pub fn baseFunc2(self: I) void { _ = self; }
        }
    }
}

pub const IChild = struct {
    pub usingnamespace zoop.Api(@This());
    ...
    pub fn Api(comptime I: type) type {
        return struct {
            pub fn childFunc(self: I) void { _ = self; }
        }
    }
}
```
Through the calculation of [zoop.Api](zoop#Api), the above code is equivalent to:
```zig
pub const IBase = struct {
    ...
    pub fn baseFunc1(self: IBase) void { _ = self; }
    pub fn baseFunc2(self: IBase) void { _ = self; }
}

pub const IChild = struct {
    ...
    pub fn baseFunc1(self: IChild) void { _ = self; }
    pub fn baseFunc2(self: IChild) void { _ = self; }
    pub fn childFunc(self: IChild) void { _ = self; }
}
```

---
### The principle of Fn{#Fn}
The declaration of [Fn](#Fn) is as follows:
```zig
pub fn Fn(comptime T: type) type
```
Suppose there is the following `Class` definition:
```zig
pub const Base = struct {
    pub usingnamespace zoop.Fn(@This());
    ...
    pub fn someFunc(self: *Base) void { _ = self; }
    pub fn Fn(comptime T: type) type {
        return zoop.Method(.{
            struct {
                pub fn baseFunc(this: *T) void { _ = this; }
            },
        });
    }
};

pub const Child = struct {
    pub const extends = .{Base};
    pub usingnamespace zoop.Fn(@This());
    ...
    pub fn Fn(comptime T: type) type {
        return zoop.Method(.{
            struct {
                pub fn childFunc(this: *T) void { _ = this; }
            },
        });
    }
}
```
Through the calculation of [zoop.Fn](zoop#Fn), the above code is ultimately equivalent to:
```zig
pub const Base = struct {
    ...
    pub fn someFunc(self: *Base) void { _ = self; }
    pub fn baseFunc(this: *Base) void { _ = this; }
}

pub const Child = struct {
    ...
    pub fn baseFunc(this: *Child) void { _ = this; }
    pub fn childFunc(this: *Child) void { _ = this; }
}
```
:::tip Note
- Note that *Base.someFunc* is not inherited by *Child*, because only methods defined in [Fn](#Fn) participate in inheritance.

- Note that the first parameter of *Base.someFunc* is called *self*, while the first parameter of other functions in [Fn](#Fn) is called *this*. This is a recommended specification, so that in functions with *this*, *self* can still be defined to point to the `Class` where the function is implemented.

- [zoop.Method](zoop#Method) is actually just an alias for [tuple.Init](tuple#Init).
:::
