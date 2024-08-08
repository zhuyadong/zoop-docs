# IObject
`IObject` 是所有接口的父接口，是所有 [Class](principle#term) 自动实现的接口。

## as {#as}
```zig
pub fn as(self: I, comptime T: type) t: {
    break :t if (isInterface(T)) ?T else ?*T;
}
```
:::info 功能：动态转换对象类型
参数：
- `self`: 想转换的接口实例
- `T`: 想转为的类型，可以是 [Class](principle#term) 或 [Interface](principle#term)

返回：如果可以转换，返回转换后的对象或者接口，否则返回 `null`
:::
:::tip 注意
这个转换需要进行一次 `std.StaticStringMap.get()` 操作，是有开销的
:::

## asptr {#asptr}
```zig
pub fn asptr(self: I) *anyopaque
```
:::info 功能：获取 [rootptr](principle#term)
参数：
- `self`: 目标接口实例

返回：`self` 的 [rootptr](principle#term)
:::

## asraw {#asraw}
```zig
pub fn asraw(self: I) IRaw
```
:::info 功能：复制 `self.ptr` 和 `self.vptr` 到 [IRaw](iraw)
参数：
- `self`: 源 [Interface](principle#term)

返回：一个复制了 `self.ptr` 和 `self.vptr` 值的 [IRaw](iraw)
:::

:::tip asraw 相当于如下代码
```zig
pub fn asraw(self: I) IRaw {
    return IRaw{.ptr = self.ptr, .vptr = @ptrCast(self.vptr)};
}
```
:::

## eql {#eql}
```zig
pub fn eql(self: I, other: I) bool
```
:::info 功能：比较两个接口实例是否相等
参数：
- `self`: 参与比较的接口之一
- `other`: 另一个接口

返回：相等返回 `true` 否则 `false`
:::

## destroy {#destroy}
```zig
pub fn destroy(self: I) void
```
:::info 功能：同 [Class.destroy()](class#destroy)