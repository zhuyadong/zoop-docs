# zoop.tuple
---
`Tuple` 有三种：
- `empty`: `.{}`
- `raw`: `.{a, b, ...}`
- `tuple`: `struct { pub const value = .{a, b, ...}; }`
  
最后一种是归一化的形式，各种对Tuple的计算输出的都是`tuple`。

## tuple.Init {#Init}
```zig
pub fn Init(comptime any: anytype) type;
```
:::info 功能： 把任意 `comptime` 值变成 `tuple`
参数：
- `any`: 任意 `comptime` 值
  
返回：归一化后的`tuple`

例子：
```zig
const result = tuple.Init(.{.one, .two});
```
result： `struct { pub const value = .{.one, .two}; }`

```zig
const result = tuple.Init(.one);
```
result： `struct { pub const value = .{.one}; }`

```zig
const result = tuple.Init(struct { const x = 1; });
```
result： `struct { pub const value = .{struct { const x = 1; }}; }`
:::

## tuple.Append {#Append}
```zig
pub fn Append(comptime any: anytype, comptime any2: anytype) type;
```
:::info 功能：返回一个新`tuple`，内容是在 any 后添加 any2 后的值
参数：
- `any`: 任意 `comptime` 值
- `any2`: 任意 `comptime` 值
  
返回：包含 any 追加 any2 内容后新的 `tuple`

例子：
```zig
const result = tuple.Append(.{.one, .two}, .{.one, .three});
```
result： `struct { pub const value = .{.one, .two, .one, .three}; }`
:::

## tuple.AppendUnique {#AppendUnique}
```zig
pub fn AppendUnique(comptime any: anytype, comptime any2: anytype) type;
```
:::info 功能：返回一个新`tuple`，内容是在 any 后添加 any2 并去重后的值
参数：
- `any`: 任意 `comptime` 值
- `any2`: 任意 `comptime` 值
  
返回：包含 any 追加 any2 并去重后的 `tuple`

例子：
```zig
const result = tuple.AppendUnique(.one, .{.one, .two});
```
result： `struct { pub const value = .{.one, .two}; }`
:::

## tuple.Remove {#Remove}
```zig
pub fn Remove(comptime any: anytype, comptime any_remove: anytype) type;
```
:::info 功能：返回一个新`tuple`，内容是所有 any 中没有在 any_remove 中出现过的值
参数：
- `any`: 任意 `comptime` 值
- `any_remove`: 任意 `comptime` 值
  
返回：一个`tuple`, 包含所有 any 中没有在 any_remove 中出现过的值

例子：
```zig
const result = tuple.Remove(.{1,2,3,4}, .{2, 3});
```
result： `struct { pub const value = .{1, 4}; }`
:::

## tuple.Unique {#Unique}
```zig
pub fn Unique(comptime any: anytype) type;
```
:::info 功能：去除 any 中重复的项
参数：
- `any`: 任意 `comptime` 值
  
返回：any 去重后的`tuple`

例子：
```zig
const result = tuple.Unique(.{1, 2, 1, 3, 1, 4});
```
result： `struct { pub const value = .{1, 2, 3, 4}; }`
:::

## tuple.Intersection {#Intersection}
```zig
pub fn Intersection(comptime any: anytype, comptime any2: anytype) type
```
:::info 功能：求 any 和 any2 的交集
- `any`: 任意 `comptime` 值
- `any2`: 任意 `comptime` 值

返回：any 和 any2 的交集 `tuple`

例子：
```zig
const result = tuple.Intersection(.{ 1, 2, 3, 4 }, .{ 4, 5, 6 });
```
result: `struct { pub const value = .{4}; }`
:::

## tuple.len {#len}
```zig
pub inline fn len(any: anytype) comptime_int;
```
:::info 功能：计算 any 的长度
参数：
- `any`: 任意 `comptime` 值
  
返回：any 的长度

例子：
```zig
const t = std.testing;
try t.expect(tuple.len(.{}) == 0);
try t.expect(tuple.len(8) == 1);
try t.expect(tuple.len(.{1}) == 1);
try t.expect(tuple.len(tuple.Init(.{1, .x})) == 2);
```
:::

## tuple.isRaw {#isRaw}
```zig
pub inline fn isRaw(any: anytype) bool;
```
:::info 功能：测试 any 是否是 raw 类型
参数：
- `any`: 任意 `comptime` 值
  
返回：是 raw 类型返回 `true` 否则返回 `false`

例子：
```zig
const t = std.testing;
try t.expect(isRaw(.{1,2}) == true);
try t.expect(isRaw(tuple.Init(.{1,2})) == false);
```
:::

## tuple.isEmpty {#isEmpty}
```zig
pub inline fn isEmpty(any: anytype) bool;
```
:::info 功能：测试 any 是不是 `.{}`
参数：
- `any`: 任意 `comptime` 值
  
返回：any 是 `.{}` 返回 `true` 否则返回 `false`

例子：
```zig
const t = std.testing;
try t.expect(tuple.isEmpty(.{}) == true);
try t.expect(tuple.isEmpty(.{1}) == false);
```
:::

## tuple.existed {#existed}
```zig
pub inline fn existed(any: anytype, val: anytype) bool;
```
:::info 功能：测试 any 中是否包含 val
参数：
- `any`: 任意 `comptime` 值
- `val`: 任意 `comptime` 值
  
返回：any 包含 val 返回 `true` 否则 `false`

例子：
```zig
const t = std.testing;
try t.expect(tuple.existed(.{1, 2, .x}, .x) == true);
try t.expect(tuple.existed(.{1, 2, .x}, .y) == false);
```
::::