# 类型转换
`zoop` 支持父类，子类，接口相互之间的类型转换。类型转换分为两种：
- 静态转换：用户能确认成功的转换，如果用户出错，那么会出现编译错误或者 [@panic](https://ziglang.org/documentation/0.13.0/#panic)
- 动态转换：转换失败也不会导致编译错误或者 [@panic](https://ziglang.org/documentation/0.13.0/#panic)，只是转换结果为 `null` 而已

## 静态转换 {#cast}
静态转换通过类的 [cast()](../reference/class#cast) 方法进行。 支持两种静态转换：
- 子类指针可以静态转换成父类指针 (反过来不可以)
```zig
var sub: *SubClass = try SubClass.new(allocator);
var base: *Basic = sub.cast(Basic);
```
- 类指针可以静态转换成实现的任意接口
```zig
var sub: *SubClass = try SubClass.new(allocator);
var iobj: zoop.IObject = sub.cast(zoop.IObject);
var ibas: IBasic = sub.cast(IBasic);
```
:::tip 注意
从类到接口的静态转换，类必须是 [rootptr](../reference/principle#term) 指向的对象，举例说明：
```zig
var sub: *SubClass = try SubClass.new(allocator);
var base: *Basic = sub.cast(Basic);
```
上面代码中 `sub` 就是 [rootptr](../reference/principle#term) 指向的对象， `base` 不是，因为 `base` 实际上指向 `sub.mixin.data.modname_Basic`。
:::
## 动态转换 {#as}
动态转换通过类的 [as()](../reference/class#as) 方法和接口的 [as()](../reference/iobject#as) 方法进行。支持类和接口两两之间的转换，共4种:
```zig
var sub: *SubClass = try SubClass.new(allocator);

// 1 类到类
var bas: ?Basic = sub.as(Basic);
sub = bas.?.as(SubClass).?;

// 2 类到接口
var iobj: ?zoop.IObject = sub.as(zoop.IObject);

// 3 接口到接口
var ibas: ?IBasic = iobj.?.as(IBasic);

// 4 接口到类
sub = iobj.?.as(SubClass).?;
bas = iobj.?.as(Basic);
```
:::tip 注意
- 动态转换需要执行数组搜索操作，不是0成本的。而静态转换只有指针操作，近乎0成本。
- 动态转换不需要对象是 [rootptr](../reference/principle#term) 指向的对象
:::