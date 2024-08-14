# Class
所有 [Class](principle#term) 都自动拥有如下的 API
:::tip 注意
- `zoop` 的对象把清理数据和释放内存分成两个函数调用，清理数据使用 `deinit()`，释放内存使用 [destroy()](#destroy)，因为 [destroy()](#destroy) 会自动调用 `deinit()`，所以用户不需要手动调用 `deinit()`。
- `deinit()` 函数可以没有。
:::

## new {#new}
```zig
pub fn new(ally: std.mem.Allocator) !*Self
```
:::info 功能：堆上创建一个对象
参数：
- `ally`: 内存分配器

返回：如果成功返回创建的对象，否则 `std.heap.Allocator.Error`
:::

## make {#make}
```zig
pub fn make() Self
```
:::info 功能：栈上创建一个对象
返回：创建的对象
:::
:::tip 注意
用 [make()](#make) 创建的对象，一定要调用 [initMixin()](#initMixin) 后才能正常使用
:::

## initMixin {#initMixin}
```zig
pub fn initMixin(self: *Self) void
```
:::info 功能：初始化 `self.mixin`
参数：
- `self`: 目标对象
:::

## destroy {#destroy}
```zig
pub fn destroy(self: *Self) void
```
:::info 功能：销毁对象
参数：
- `self`: 目标对象
:::
:::tip 注意
无论堆上分配的还是栈上分配的对象，都需要调用 [destroy()](#destroy) (除非是堆上分配并确认不需要调用 `deinit()`)，因为 [destroy()](#destroy) 负责调用对象和其父类所有 `deinit()`
:::

## as {#as}
```zig
pub fn as(self: *const Self, comptime T: type) t: {
    break :t if (isInterface(T)) ?T else ?*T;
}
```
:::info 功能：动态转换对象类型
参数：
- `self`: 想转换的对象
- `T`: 想转为的类型，可以是 [Class](principle#term) 或 [Interface](principle#term)

返回：如果可以转换，返回转换后的对象或者接口，否则返回 `null`
:::
:::tip 注意
这个转换需要进行一次数组搜索操作，是有开销的
:::

## cast {#cast}
```zig
pub fn cast(self: *const Self, comptime T: type) t: {
    break :t if (isInterface(T)) T else *T;
}
```
:::info 功能：静态转换对象类型
参数：
- `self`: 想转换的对象
- `T`: 想转为的类型，可以是 [Class](principle#term) 或 [Interface](principle#term)

返回：如果可以转换，返回转换后的对象或者接口，否则编译出错
:::

:::tip 注意
这个转换基本没有开销，最多只有一次指针加法
:::

## asptr {#asptr}
```zig
pub fn asptr(self: *const Self) *anyopaque
```
:::info 功能：获取 [rootptr](principle#term)
参数：
- `self`: 目标对象

返回：`self` 的 [rootptr](principle#term)
:::