# zoop.tuple
---
There are three types of Tuple:
- `empty`: `.{}`
- `raw`: `.{a, b, ...}`
- `tuple`: `struct { pub const value = .{a, b, ...}; }`
 
The last one is the normalized form, and all calculations on Tuple output are `tuple`.

## tuple.Init {#Init}
```zig
pub fn Init(comptime any: anytype) type;
```
:::info Function: Convert any `comptime` value into a `tuple`
parameter:
- `any`: any `comptime` value
 
Returns: normalized `tuple`

example:
```zig
const result = tuple.Init(.{.one, .two});
```
result: `struct { pub const value = .{.one, .two}; }`

```zig
const result = tuple.Init(.one);
```
result: `struct { pub const value = .{.one}; }`

```zig
const result = tuple.Init(struct { const x = 1; });
```
result: `struct { pub const value = .{struct { const x = 1; }}; }`
:::

## tuple.Append {#Append}
```zig
pub fn Append(comptime any: anytype, comptime any2: anytype) type;
```
:::info Function: Returns a new `tuple`, the content of which is the value of any2 added after any
parameter:
- `any`: any `comptime` value
- `any2`: any `comptime` value
 
Returns: A new `tuple` containing any with the contents of any2 appended

example:
```zig
const result = tuple.Append(.{.one, .two}, .{.one, .three});
```
result: `struct { pub const value = .{.one, .two, .one, .three}; }`
:::

## tuple.AppendUnique {#AppendUnique}
```zig
pub fn AppendUnique(comptime any: anytype, comptime any2: anytype) type;
```
:::info Function: Returns a new `tuple`, which contains the value of any2 added after any and without duplicates
parameter:
- `any`: any `comptime` value
- `any2`: any `comptime` value
 
Returns: A tuple containing any appended with any2 and without duplicates

example:
```zig
const result = tuple.AppendUnique(.one, .{.one, .two});
```
result: `struct { pub const value = .{.one, .two}; }`
:::

## tuple.Remove {#Remove}
```zig
pub fn Remove(comptime any: anytype, comptime any_remove: anytype) type;
```
:::info Function: Returns a new `tuple` containing all the values ​​in any that have not appeared in any_remove
parameter:
- `any`: any `comptime` value
- `any_remove`: any `comptime` value
 
Returns: A `tuple` containing all the values ​​in any that are not present in any_remove

example:
```zig
const result = tuple.Remove(.{1,2,3,4}, .{2, 3});
```
result: `struct { pub const value = .{1, 4}; }`
:::

## tuple.Unique {#Unique}
```zig
pub fn Unique(comptime any: anytype) type;
```
:::info Function: Remove duplicate items in any
parameter:
- `any`: any `comptime` value
 
Returns: any tuple after deduplication

example:
```zig
const result = tuple.Unique(.{1, 2, 1, 3, 1, 4});
```
result: `struct { pub const value = .{1, 2, 3, 4}; }`
:::

## tuple.Intersection {#Intersection}
```zig
pub fn Intersection(comptime any: anytype, comptime any2: anytype) type
```
:::info Function: Find the intersection of any and any2
- `any`: any `comptime` value
- `any2`: any `comptime` value

Returns: the intersection of any and any2 `tuple`

example:
```zig
const result = tuple.Intersection(.{ 1, 2, 3, 4 }, .{ 4, 5, 6 });
```
result: `struct { pub const value = .{4}; }`
:::

## tuple.len {#len}
```zig
pub inline fn len(any: anytype) comptime_int;
```
:::info Function: Calculate the length of any
parameter:
- `any`: any `comptime` value
 
Returns: the length of any

example:
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
:::info Function: Test whether any is of raw type
parameter:
- `any`: any `comptime` value
 
Return: if it is raw type, return `true`, otherwise return `false`

example:
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
:::info Function: Test whether any is `.{}`
parameter:
- `any`: any `comptime` value
 
Returns: any is `.{}` returns `true` otherwise returns `false`

example:
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
:::info Function: Test whether any contains val
parameter:
- `any`: any `comptime` value
- `val`: any `comptime` value
 
Returns: any containing val returns `true` otherwise `false`

example:
```zig
const t = std.testing;
try t.expect(tuple.existed(.{1, 2, .x}, .x) == true);
try t.expect(tuple.existed(.{1, 2, .x}, .y) == false);
```
:::
