# IObject
`IObject` is the parent interface of all interfaces and is the interface automatically implemented by all [Class](principle#term).

## as {#as}
```zig
pub fn as(self: I, comptime T: type) t: {
    break :t if (isInterface(T)) ?T else ?*T;
}
```
:::info Function: Dynamically convert object types
parameter:
- `self`: the interface instance you want to convert
- `T`: the type you want to convert to, which can be [Class](principle#term) or [Interface](principle#term)

Return: If the conversion is possible, return the converted object or interface, otherwise return `null`
:::
:::tip Note
This conversion requires an array search operation, which is expensive.
:::

## asptr {#asptr}
```zig
pub fn asptr(self: I) *anyopaque
```
:::info Function: Get [rootptr](principle#term)
parameter:
- `self`: target interface instance

Returns: [rootptr](principle#term) of `self`
:::

## asraw {#asraw}
```zig
pub fn asraw(self: I) IRaw
```
:::info Function: Copy `self.ptr` and `self.vptr` to [IRaw](iraw)
parameter:
- `self`: source[Interface](principle#term)

Returns: An [IRaw](iraw) with the values ​​of `self.ptr` and `self.vptr` copied
:::

:::tip asraw is equivalent to the following code
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
:::info Function: Compare whether two interface instances are equal
parameter:
- `self`: one of the interfaces involved in the comparison
- `other`: another interface

Returns: true if equal, false otherwise
:::

## destroy {#destroy}
```zig
pub fn destroy(self: I) void
```
:::info Function: Same as [Class.destroy()](class#destroy)
