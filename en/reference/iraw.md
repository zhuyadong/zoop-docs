# IRaw
[IRaw](iraw) is the [Interface](principle#term) version of `*anyopaque`
```zig
pub const IRaw = struct {
    ptr: *anyopaque,
    vptr: *anyopaque,
};
```
Convert to [IRaw](iraw) via [asraw()](iobject#asraw), and then convert to any [Interface](principle#term) via [IRaw.cast()](#cast). No type information is used here, so the user must ensure the correctness of the conversion.

## cast {#cast}
```zig
pub fn cast(self: IRaw, comptime I: type) I
```
:::info Function: Force conversion to an interface of type `I`
parameter:
- `self`: source [IRaw](iraw) instance
- `I`: target type
 
Returns: An `I` instance that directly copies `self.ptr` and `self.vptr`
:::
:::tip cast is equivalent to the following code
```zig
pub fn cast(self: IRaw, comptime I: type) I {
    return I{.ptr = self.ptr, .vptr = @ptrCast(@alignCast(self.vptr))};
}
```
:::
