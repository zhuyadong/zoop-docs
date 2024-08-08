# IRaw
[IRaw](iraw) 的作用相当于 [Interface](principle#term) 版的 `*anyopaque`
```zig
pub const IRaw = struct {
    ptr: *anyopaque,
    vptr: *anyopaque,
};
```
通过 [asraw()](iobject#asraw) 转化为 [IRaw](iraw)，再通过 [IRaw.cast()](#cast) 转化为任意 [Interface](principle#term)。这里没有使用类型信息，所以用户要自己保证转换的正确性。

## cast {#cast}
```zig
pub fn cast(self: IRaw, comptime I: type) I
```
:::info 功能：强制转化为 `I` 类型的接口
参数：
- `self`: 源 [IRaw](iraw) 实例
- `I`: 目标类型
  
返回：直接复制了 `self.ptr` 和 `self.vptr` 的 `I` 实例
:::
:::tip cast 相当于如下代码
```zig
pub fn cast(self: IRaw, comptime I: type) I {
    return I{.ptr = self.ptr, .vptr = @ptrCast(@alignCast(self.vptr))};
}
```
:::