# Class
All [Class](principle#term) automatically have the following API
:::tip Note
- The `zoop` object separates data cleaning and memory release into two function calls. `deinit()` is used to clean up data, and [destroy()](#destroy) is used to release memory. Because [destroy()](#destroy) will automatically call `deinit()`, users do not need to call `deinit()` manually.
- `deinit()` function can be omitted.
:::

## new {#new}
```zig
pub fn new(ally: std.mem.Allocator) !*Self
```
:::info Function: Create an object on the heap
parameter:
- `ally`: memory allocator

Returns: If successful, return the created object, otherwise `std.heap.Allocator.Error`
:::

## make {#make}
```zig
pub fn make() Self
```
:::info Function: Create an object on the stack
Returns: the created object
:::
:::tip Note
Objects created with [make()](#make) must call [initMixin()](#initMixin) before they can be used normally
:::

## initMixin {#initMixin}
```zig
pub fn initMixin(self: *Self) void
```
:::info Function: Initialize `self.mixin`
parameter:
- `self`: target object
:::

## destroy {#destroy}
```zig
pub fn destroy(self: *Self) void
```
:::info Function: Destroy object
parameter:
- `self`: target object
:::
:::tip Note
Regardless of whether the object is allocated on the heap or on the stack, you need to call [destroy()](#destroy) (unless it is allocated on the heap and it is confirmed that you do not need to call `deinit()`), because [destroy()](#destroy) is responsible for calling all `deinit()` of the object and its parent class
:::

## as {#as}
```zig
pub fn as(self: *const Self, comptime T: type) t: {
break :t if (isInterface(T)) ?T else ?*T;
}
```
:::info Function: Dynamically convert object types
parameter:
- `self`: the object to be converted
- `T`: the type you want to convert to, which can be [Class](principle#term) or [Interface](principle#term)

Return: If the conversion is possible, return the converted object or interface, otherwise return `null`
:::
:::tip Note
This conversion requires a `std.StaticStringMap.get()` operation, which is expensive.
:::

## cast {#cast}
```zig
pub fn cast(self: *const Self, comptime T: type) t: {
break :t if (isInterface(T)) T else *T;
}
```
:::info Function: static conversion of object type
parameter:
- `self`: the object to be converted
- `T`: the type you want to convert to, which can be [Class](principle#term) or [Interface](principle#term)

Return: If the conversion is possible, the converted object or interface is returned, otherwise a compilation error occurs
:::

:::tip Note
This conversion has almost no overhead, at most one pointer addition.
:::

## asptr {#asptr}
```zig
pub fn asptr(self: *const Self) *anyopaque
```
:::info Function: Get [rootptr](principle#term)
parameter:
- `self`: target object

Returns: [rootptr](principle#term) of `self`
:::
