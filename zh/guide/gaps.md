# 查漏补缺
这里是一些之前关于 `zoop` 内容的补充。

## 容易混淆的概念
### 可继承方法中的 `this: *T` 中的 `T` 到底是什么
这个 `T` 可以是类本身，或者任何一个子类，因为可继承函数会在类本身和所有子类上展开，展开的时候代入 `T` 的就是类本身或者子类。

所以在可继承方法中，要访问 `Self` 的数据和方法之前，要先把 `this` 通过 [cast()](../reference/class#cast) 静态转换为 `Self` 后再使用。这也是参数为什么叫 `this` 而不是 `self` 的原因，因为传入的参数不一定是 `Self` 类型。

### `rootptr` 到底是什么 {#rootptr}
`rootptr` 的存在，是为了 [类型转换](as-cast)。当一个子类指针转换到父类后，怎样才能再转回子类？当前指针指向的是父类的数据，要能再转回子类，则父类的数据中，一定要有最初的那个指向子类数据的指针，这个指针，就是 `rootptr`，就保存在父类的 `mixin` 字段中。下面给出详细例子有助于更好的理解什么是 `rootptr`。
我们假设 `SubClass` 是 `Base` 的子类，则下面的逻辑成立：
```zig
const t = std.testing;

var sub: *SubClass = try SubClass.new(allocator);
var base: *Base = sub.cast(Base);

const psub: *anyopaque = @ptrCast(sub);
const typeinfo: *const zoop.TypeInfo = zoop.typeInfo(SubClass);

const iobj:IObject = sub.cast(IObject);
const ibase:IObject = base.as(IObject).?;

const sub_rootptr: *anyopaque = sub.mixin.meta.?.rootptr.?;
const sub_typeinfo: *const zoop.TypeInfo  = sub.mixin.meta.?.typeinfo;

const base_rootptr: *anyopaque = base.mixin.meta.?.rootptr.?;
const base_typeinfo: *const zoop.TypeInfo  = base.mixin.meta.?.typeinfo.?;

try t.expect(sub_rootptr == psub)
try t.expect(base_rootptr == psub)
try t.expect(iobj.ptr == psub)
try t.expect(ibase.ptr == psub)
try t.expect(sub_typeinfo == typeinfo)
try t.expect(base_typeinfo == typeinfo)
```
:::info 说明
- 由 [new()](../reference/class#new) 创建的对象的 `rootptr` 指向对象自己地址，`typeinfo` 指向对象类型的 `TypInfo`
- 对象转换成的任何类型的对象的 `rootptr` 仍然指向由 [new()](../reference/class#new) 创建的对象的地址，`typeinfo` 仍然指向由 [new()](../reference/class#new) 创建的对象的类型的 `TypeInfo`
- 对象转换成的任何类型的接口的 `ptr` 仍然指向由 [new()](../reference/class#new) 创建的对象的地址
- 对象转换成的任何类型的对象转换成的任何接口的 `ptr` 仍然指向由 [new()](../reference/class#new) 创建的对象的地址

结论：`rootptr` 就是由 [new()](../reference/class#new) 创建的对象的地址，类型转换后不会影响这个值。

PS: 由 [make()](../reference/class#make) 创建的对象同样成立。
:::