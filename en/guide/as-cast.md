# Type conversion
`zoop` supports type conversion between parent classes, subclasses, and interfaces. Type conversion is divided into two types:
- Static conversion: users can confirm successful conversion. If the user makes a mistake, a compile error or [@panic](https://ziglang.org/documentation/0.13.0/#panic) will appear.
- Dynamic conversion: Conversion failure will not cause compilation errors or [@panic](https://ziglang.org/documentation/0.13.0/#panic), the conversion result will just be `null`

## Static conversion {#cast}
Static conversion is performed through the [cast()](../reference/class#cast) method of the class. Two types of static conversion are supported:
- Subclass pointers can be statically converted to parent class pointers (but not vice versa)
```zig
var sub: *SubClass = try SubClass.new(allocator);
var base: *Basic = sub.cast(Basic);
```
- Class pointers can be statically converted to any implemented interface
```zig
var sub: *SubClass = try SubClass.new(allocator);
var iobj: zoop.IObject = sub.cast(zoop.IObject);
var ibas: IBasic = sub.cast(IBasic);
```
:::tip Note
For static conversion from a class to an interface, the class must be the object pointed to by [rootptr](../reference/principle#term). For example:
```zig
var sub: *SubClass = try SubClass.new(allocator);
var base: *Basic = sub.cast(Basic);
```
In the above code, `sub` is the object pointed to by [rootptr](../reference/principle#term), but `base` is not, because `base` actually points to `sub.mixin.data.modname_Basic`.
:::
## Dynamic conversion {#as}
Dynamic conversion is performed through the [as()](../reference/class#as) method of the class and the [as()](../reference/iobject#as) method of the interface. It supports conversion between classes and interfaces in four ways:
```zig
var sub: *SubClass = try SubClass.new(allocator);

// 1 class to class
var bas: ?Basic = sub.as(Basic);
sub = bas.?.as(SubClass).?;

// 2 classes to interfaces
var iobj: ?zoop.IObject = sub.as(zoop.IObject);

// 3 interface to interface
var ibas: ?IBasic = iobj.?.as(IBasic);

// 4 interface to class
sub = iobj.?.as(SubClass).?;
bas = iobj.?.as(Basic);
```
:::tip Note
- Dynamic conversion requires an array search operation, which is not 0 cost. Static conversion only requires pointer operations, which is almost 0 cost.
- Dynamic conversion does not require the object to be the object pointed to by [rootptr](../reference/principle#term)
:::
