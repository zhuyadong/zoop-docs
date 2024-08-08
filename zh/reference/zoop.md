# zoop

## zoop.Fn {#Fn}
```zig
pub fn Fn(comptime T: type) type
```
:::info 功能：计算`T`的 所有 [Method](principle#term)， 参考 [Fn 原理](principle#Fn)
参数：
- `T`: [Class](principle#term)
  
返回：一个 [tuple](tuple)， 包含通过调用 `T` 和其所有父类的 [Fn](principle#Fn) 函数返回的所有 [Method](principle#term)

例子：
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
:::info 功能：计算`I`的 所有 [ApiMethod](principle#term)， 参考 [Api 原理](principle#Api)
参数：
- `I`: [Interface](principle#term)
  
返回：一个 [tuple](tuple)， 包含通过调用 `I` 和其所有父接口的 [Api](principle#Api) 函数返回的所有 [ApiMethod](principle#term)

例子：
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
:::info 功能：计算 `I` 的 [Vtable](principle#term)
参数：
- `I`: [Interface](principle#term)
- `APIs`: 一个 *zig struct*，包含 `I` 定义的函数接口的指针数据

返回：一个 *zig struct*，包含 `I` 和其父接口定义的函数接口的指针数据

例子：
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
:::info 功能：计算`T`的 [Mixin](principle#Mixin) 数据类型, 参考 [Mixin 设计](principle#Mixin)
参数：
- `T`: [Class](principle#term)
  
返回：`T`的 [Mixin](principle#Mixin) 数据类型

例子：
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
:::info 功能：同 [tuple.Init](tuple#Init)
例子：
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
:::info 功能：获取包含 `T` 实现/继承的所有接口 (不包含 `zoop.IObject`)
参数：
- `T`：[Interface](principle#term) 或者 [Class](principle#term)

返回：一个 [tuple](tuple)，包含 `T` 实现/继承的所有接口 (不包含 `zoop.IObject`)
:::

## zoop.SuperClasses {#SuperClasses}
```zig
pub fn SuperClasses(comptime T: type) type
```
:::info 功能：获取包含 `T` 所有直接或者间接的父类
参数：
- `T`：[Class](principle#term)

返回：一个 [tuple](tuple)，包含 `T` 所有直接或者间接的父类 
:::

## zoop.DirectSuperClasses {#DirectSuperClasses}
```zig
pub fn DirectSuperClasses(comptime T: type) type
```
:::info 功能：获取包含 `T` 所有直接父类的 [tuple](tuple)
参数：
- `T`：[Class](principle#term)

返回：一个 [tuple](tuple)，包含 `T` 所有直接父类
:::

## zoop.SuperRoute {#SuperRoute}
```zig
pub fn SuperRoute(comptime T: type, comptime Target: type) type
```
:::info 功能：计算继承树上从 `T` 到 `Target` 依次经过的所有类
参数：
- `T`: 起点 [Class](principle#term)
- `Target`: 终点 [Class](principle#term)

返回：一个 [tuple](tuple)，包含继承树上从 `T` 到 `Target` 依次经过的所有类 (结果包含 `Target` 但不包含 `T`)
:::

## zoop.typeInfo {#typeInfo}
```zig
pub fn typeInfo(any: anytype) *const TypeInfo
```
:::info 功能：获取 `any` 的 [TypeInfo](principle#TypeInfo)
参数：
- `any`: [Interface](principle#term) 实例，或者 [Class](principle#term) 类型/实例指针 

返回：`any` 的 [TypeInfo](principle#TypeInfo)

例子：
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
:::info 功能：获取 `any` 的 [MetaInfo](principle#MetaInfo)
参数：
- `any`: [Interface](principle#term) 实例，或者 [Class](principle#term) 实例指针 

返回：`any` 的 [MetaInfo](principle#MetaInfo)

例子：
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
:::info 功能：判断 `ptr` 是否等于 [rootptr](principle#term)
参数：
- `ptr`: [Class](principle#term) 实例指针 

返回：`ptr` 等于 [rootptr](principle#term) 返回 `true` 否则 `false`

例子：
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
:::info 功能：判断 `T` 是否是 [Interface](principle#term)
参数：
- `T`: 任意 *zig type*
  
返回：`T` 是 [Interface](principle#term) 返回 `true` 否则 `false`
:::
## zoop.isClass {#isClass}
```zig
pub inline fn isClass(comptime T: type) bool
```
:::info 功能：判断 `T` 是否是 [Class](principle#term)
参数：
- `T`: 任意 *zig type*
  
返回：`T` 是 [Class](principle#term) 返回 `true` 否则 `false`
:::

## zoop.mixinName {#mixinName}
```zig
pub fn mixinName(comptime T: type) []const u8
```
:::info 功能：计算 `T` 在 [MixinData](principle#MixinData) 中的名字
参数：
- `T`: [Class](principle#term)

返回：`T` 在 [MixinData](principle#MixinData) 中的名字

例子：
```zig
const t = std.testing;
try t.expectEqualStrings(zoop.mixinName(mymod.SomeClass), "mymod_SomeClass");
```
:::

## zoop.mixinName0 {#mixinName0}
```zig
pub fn mixinName0(comptime T: type) [:0]const u8
```
:::info 功能：同 [mixinName](#mixinName)，区别是返回0结尾的字符串
:::

## zoop.setHook {#setHook}
```zig
pub const HookFunc = *const fn (obj: IObject) void;
pub fn setHook(new_hook: ?HookFunc, destroy_hook: ?HookFunc) void
```
:::info 功能：设置监视对象创建和销毁的钩子函数
参数：
- `new_hook`：对象创建钩子函数，传入 `null` 则清除之前设置的钩子函数
- `destroy_hook`：对象销毁钩子函数，传入 `null` 则清除之前设置的钩子函数
:::