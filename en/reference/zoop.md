# zoop

## zoop.Fn {#Fn}
```zig
pub fn Fn(comptime T: type) type
```
:::info Function: Calculate all [Method](principle#term) of `T`, refer to [Fn principle](principle#Fn)
parameter:
- `T`: [Class](principle#term)
 
Returns: A [tuple](tuple) containing all the methods returned by calling the [Fn](principle#Fn) function of `T` and all its superclasses.

example:
```zig{3}
const SomeClass = struct {
    pub const extends = .{BaseClass}
    pub usingnamespace zoop.Fn(@This());
}
```
:::

## zoop.Api {#Api}
```zig
pub fn Api(comptime I: type) type
```
:::info Function: Calculate all [ApiMethod](principle#term) of `I`, refer to [Api principle](principle#Api)
parameter:
- `I`: [Interface](principle#term)
 
Returns: A [tuple](tuple) containing all ApiMethods returned by calling the [Api](principle#Api) functions of `I` and all its parent interfaces.

example:
```zig{4}
pub const ISome = struct {
    pub const extends = .{IBase}
    pub usingnamespace zoop.Api(@This());
}
```
:::

## zoop.DefVtable {#DefVtable}
```zig
pub fn DefVtable(comptime I: type, comptime APIs: type) type
```
:::info Function: Calculate the [Vtable](principle#term) of `I`
parameter:
- `I`: [Interface](principle#term)
- `APIs`: a *zig struct* containing pointers to the function interfaces defined by `I`

Returns: a *zig struct* containing pointer data of the function interface defined by `I` and its parent interface

example:
```zig
pub const ISome = struct {
    pub const extends = .{IBase}
    pub const Vtable = zoop.DefVtable(@This(), struct {
        someFunc1: *fn const(*anyopaque) void,
        someFunc2: *fn const(*anyopaque) void,
    });
}
```
:::

## zoop.Mixin {#Mixin}
```zig
pub fn Mixin(comptime T: type) type
```
:::info Function: Calculate the [Mixin](principle#Mixin) data type of `T`, refer to [Mixin design](principle#Mixin)
parameter:
- `T`: [Class](principle#term)
 
Returns: the [Mixin](principle#Mixin) data type of `T`

example:
```zig{3}
const SomeClass = struct {
    mixin: zoop.Mixin(@This()),
}
```
:::

## zoop.Method {#Method}
```zig
pub const Method = tuple.Init;
```
:::info Function: Same as [tuple.Init](tuple#Init)
example:
```zig{3}
pub const Some = struct {
    pub fn Fn(comptime T: type) type {
        return zoop.Method(.{
            struct {
                pub fn someFunc(this: *T) void { _ = this; }
            },
        });
    }
}
```
:::

## zoop.Interfaces {#Interfaces}
```zig
pub fn Interfaces(comptime T: type) type
```
:::info Function: Get all interfaces implemented/inherited by `T` (excluding `zoop.IObject`)
parameter:
- `T`: [Interface](principle#term) or [Class](principle#term)

Returns: A [tuple](tuple) containing all interfaces implemented/inherited by `T` (excluding `zoop.IObject`)
:::

## zoop.SuperClasses {#SuperClasses}
```zig
pub fn SuperClasses(comptime T: type) type
```
:::info Function: Get all direct or indirect parent classes of `T`
parameter:
- `T`：[Class](principle#term)

Returns: a [tuple](tuple) containing all direct or indirect parent classes of `T`
:::

## zoop.DirectSuperClasses {#DirectSuperClasses}
```zig
pub fn DirectSuperClasses(comptime T: type) type
```
:::info Function: Get a [tuple](tuple) containing all direct parent classes of `T`
parameter:
- `T`：[Class](principle#term)

Returns: a [tuple](tuple) containing all direct superclasses of `T`
:::

## zoop.SuperRoute {#SuperRoute}
```zig
pub fn SuperRoute(comptime T: type, comptime Target: type) type
```
:::info Function: Calculate all classes from `T` to `Target` in the inheritance tree
parameter:
- `T`: Starting point [Class](principle#term)
- `Target`: endpoint [Class] (principle#term)

Returns: a [tuple](tuple) containing all the classes from `T` to `Target` in the inheritance tree (the result contains `Target` but not `T`)
:::

## zoop.typeInfo {#typeInfo}
```zig
pub fn typeInfo(any: anytype) *const TypeInfo
```
:::info Function: Get the [TypeInfo](principle#TypeInfo) of `any`
parameter:
- `any`: [Interface](principle#term) instance, or [Class](principle#term) type/instance pointer

Returns: [TypeInfo](principle#TypeInfo) for `any`

example:
```zig
const t = std.testing;
var obj = try Some.new(t.allocator);
defer obj.destroy();
var iface = o.as(zoop.IObject).?;
try t.expect(zoop.typeInfo(obj) == zoop.typeInfo(iface));
try t.expect(zoop.typeInfo(obj) == zoop.typeInfo(Some));
```
:::

## zoop.metaInfo {#metaInfo}
```zig
pub fn metaInfo(any: anytype) *const MetaInfo
```
:::info Function: Get the [MetaInfo](principle#MetaInfo) of `any`
parameter:
- `any`: an [Interface](principle#term) instance, or a [Class](principle#term) instance pointer

Returns: [MetaInfo](principle#MetaInfo) of `any`

example:
```zig
const t = std.testing;
var obj = try Some.new(t.allocator);
defer obj.destroy();
var iface = o.as(zoop.IObject).?;
try t.expect(zoop.metaInfo(obj) == zoop.metaInfo(iface));
```
:::

## zoop.isRootPtr {#isRootPtr}
```zig
pub inline fn isRootPtr(ptr: anytype) bool {
```
:::info Function: Determine whether `ptr` is equal to [rootptr](principle#term)
parameter:
- `ptr`: [Class](principle#term) instance pointer

Returns: `ptr` is equal to [rootptr](principle#term) returns `true` otherwise `false`

example:
```zig
const t = std.testing;
var sub = try SubClass.new(t.allocator);
defer sub.destroy();
var base = sub.cast(BaseClass);
try t.expect(zoop.isRootPtr(sub) == true);
try t.expect(zoop.isRootPtr(base) == false);
```
:::

## zoop.isInterface {#isInterface}
```zig
pub inline fn isInterface(comptime T: type) bool
```
:::info Function: Determine whether `T` is an [Interface](principle#term)
parameter:
- `T`: any *zig type*
 
Returns: `T` is [Interface](principle#term) returns `true` otherwise `false`
:::
## zoop.isClass {#isClass}
```zig
pub inline fn isClass(comptime T: type) bool
```
:::info Function: Determine whether `T` is [Class](principle#term)
parameter:
- `T`: any *zig type*
 
Returns: `T` is [Class](principle#term) returns `true` otherwise `false`
:::

## zoop.mixinName {#mixinName}
```zig
pub fn mixinName(comptime T: type) []const u8
```
:::info Function: Calculate the name of `T` in [MixinData](principle#MixinData)
parameter:
- `T`: [Class](principle#term)

Returns: The name of `T` in [MixinData](principle#MixinData)

example:
```zig
const t = std.testing;
try t.expectEqualStrings(zoop.mixinName(mymod.SomeClass), "mymod_SomeClass");
```
:::

## zoop.mixinName0 {#mixinName0}
```zig
pub fn mixinName0(comptime T: type) [:0]const u8
```
:::info Function: Same as [mixinName](#mixinName), except that it returns a string ending with 0.
:::

## zoop.setHook {#setHook}
```zig
pub const HookFunc = *const fn (obj: IObject) void;
pub fn setHook(new_hook: ?HookFunc, destroy_hook: ?HookFunc) void
```
:::info Function: Set the hook function for monitoring object creation and destruction
parameter:
- `new_hook`: object creation hook function, passing in `null` will clear the previously set hook function
- `destroy_hook`: object destruction hook function, passing in `null` will clear the previously set hook function
:::
