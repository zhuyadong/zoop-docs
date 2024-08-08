# Filling in the gaps
Here are some additions to the previous article on zoop.

## Concepts that are easily confused
### What is `T` in `this: *T` in inherited methods?
This `T` can be the class itself, or any subclass, because the inheritable function will be expanded on the class itself and all subclasses, and when expanding, the class itself or the subclass is substituted into `T`.

Therefore, in an inheritable method, before accessing the data and methods of `Self`, `this` must be statically converted to `Self` through [cast()](../reference/class#cast) before use. This is also why the parameter is called `this` instead of `self`, because the parameter passed in is not necessarily of the `Self` type.

### What is `rootptr`?
`rootptr` exists for [type conversion](as-cast). When a subclass pointer is converted to a parent class, how can it be converted back to the subclass? The current pointer points to the parent class's data. To be able to convert back to the subclass, the parent class's data must have the original pointer to the subclass data. This pointer is `rootptr`, which is stored in the `mixin` field of the parent class. The following detailed example will help you better understand what `rootptr` is.
Assuming that `SubClass` is a subclass of `Base`, the following logic holds:
```zig
const t = std.testing;

var sub: *SubClass = try SubClass.new(allocator);
var base: *Base = sub.cast(Base);

const psub: *anyopaque = @ptrCast(sub);
const typeinfo: *const zoop.TypeInfo = zoop.typeInfo(SubClass);

const iobj:IObject = sub.cast(IObject);
const ibase:IObject = base.as(IObject).?;

const sub_rootptr: *anyopaque = sub.mixin.meta.?.rootptr.?;
const sub_typeinfo: *const zoop.TypeInfo = sub.mixin.meta.?.typeinfo;

const base_rootptr: *anyopaque = base.mixin.meta.?.rootptr.?;
const base_typeinfo: *const zoop.TypeInfo = base.mixin.meta.?.typeinfo.?;

try t.expect(sub_rootptr == psub)
try t.expect(base_rootptr == psub)
try t.expect(iobj.ptr == psub)
try t.expect(ibase.ptr == psub)
try t.expect(sub_typeinfo == typeinfo)
try t.expect(base_typeinfo == typeinfo)
```
:::info Description
- The `rootptr` of an object created by [new()](../reference/class#new) points to the address of the object itself, and `typeinfo` points to `TypInfo` of the object type
- `rootptr` of any type of object that the object is converted to still points to the address of the object created by [new()](../reference/class#new), and `typeinfo` still points to `TypeInfo` of the type of the object created by [new()](../reference/class#new)
- The `ptr` of any type of interface to which the object is cast still points to the address of the object created by [new()](../reference/class#new)
- The `ptr` of any type to which the object is converted and any interface to which the object is converted still points to the address of the object created by [new()](../reference/class#new)

Conclusion: `rootptr` is the address of the object created by [new()](../reference/class#new), and type conversion will not affect this value.

PS: The same is true for objects created by [make()](../reference/class#make).
:::
