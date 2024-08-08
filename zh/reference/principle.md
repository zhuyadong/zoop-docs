---
outline: deep
---
# 术语和原理

## 术语 {#term}
- `fatptr`: 包含两个指针的 *zig struct*，名为 *ptr* 的指向数据，名为 *vptr* 的指向函数列表
- `rootptr`: 在接口和类型转换过程中永远指向原始对象的指针
- `Class`: 符合`zoop`定义的 *Class* 规范的 *zig struct*
- `Method`: 可以被`Class`之间继承，重写，和用以实现`Interface`的属于`Class`的函数
- `ApiMethod`: 可以被`Interface`之间继承，专用于访问`Vtable`中接口函数的胶水函数，属于`Interface`的`Method`
- `Vtable`: 包含所属接口所有指向接口所属`Class`的`Method`指针的数据类型
- `Interface`: 一个`fatptr`，其 *ptr* 指向`rootptr`，其 *vptr* 指向自身的`Vtable`
- [Mixin](#Mixin): `Class`中用来保存所有父类字段和类型信息的数据类型
- [MixinData](#MixinData): [Mixin](#Mixin) 中用来保存所有父类字段的数据类型
- [MetaInfo](#MetaInfo): [Mixin](#Mixin) 中用来保存接口和类型转换信息的数据类型
- [TypeInfo](#TypeInfo): [MetaInfo](#MetaInfo) 中真正执行接口和类型转换的数据
- [DefVtable](#DefVtable): 用来为`Interface`计算`Vtable`类型的函数
- [Api](#Api): 由`Interface`实现的，用来计算自身所有`ApiMethod`的函数
- [Fn](#Fn): 由`Class`实现的，用来计算自身所有`Method`的函数

## 原理
### Mixin 的设计 {#Mixin}
先看`zoop.Mixin()`函数中关键的代码：
```zig
pub fn Mixin(comptime T: type) type {
    return struct {
        deallocator: ?std.mem.Allocator = null,
        meta: ?MetaInfo = null,
        data: MixinData(T) = .{},
        ...
    }
}
```
:::info 说明
- `deallocator`: 如果类实例在堆上分配，这里保存`allocator`；如果是栈上分配，这里为`null`
- `meta`: 元数据，包含类型和接口及相互之间转换的信息，参考 [MetaInfo](#MetaInfo)
- `data`: 保存所有父类实例数据，参考 [MixinData](#MixinData)
:::
---
### MixinData 的设计 {#MixinData}
假设在模块`mymod`中有如下的几个类定义：
```zig
pub const Base = struct {
    pub usingnamespace zoop.Fn(@This());
    mixin: zoop.Mixin(@This()),
};

pub const BaseTwo = struct {
    pub usingnamespace zoop.Fn(@This());
    mixin: zoop.Mixin(@This());
}

pub const Child = struct {
    pub const extends = .{Base, BaseTwo};
    pub usingnamespace zoop.Fn(@This());
    mixin: zoop.Mixin(@This());
}

pub const SubChild = struct {
    pub const extends = .{Child};
    pub usingnamespace zoop.Fn(@This());
    mixin: zoop.Mixin(@This());
}
```
那么所有类的 [MixinData](#MixinData) 结构如下：
```zig
MixinData(Base) = struct {};

MixinData(BaseTwo) = struct {};

MixinData(Child) = struct {
    mymod_Base: Base,
    mymod_BaseTwo: BaseTwo,
}

MixinData(SubChild) = struct {
    mymod_Child: Child,
}
```
`MixData(T)` 会根据 `T.extends` 中的内容决定返回的 *zig struct* 中包含哪些数据。
通过这样的方式，一个类就可以有条理的包含了所有父类的数据。

---
### MetaInfo 的设计 {#MetaInfo}
[MetaInfo](#MetaInfo) 支持如下的类型转换：
- 在`Class`的类继承树上任意两点之间的转换
- 在`Class`的接口继承树上任意两点之间的转换
- 在`Class`的接口和类两个继承树之间的任意两点之间的转换

简单的说，就是可以在类和接口之间进行符合直觉的任意转换。

先看看 [MetaInfo](#MetaInfo) 的关键代码：
```zig
pub const MetaInfo = packed struct {
    rootptr: ?*anyopaque = null,
    typeinfo: ?*const TypeInfo = null,
    ...
}
```
:::info 说明
- `rootptr`: `MixinData(T)`下所有父类数据的`rootptr`都指向`T`的真正地址
- `typeinfo`: 类型转换信息，详情参考 [TypeInfo](#TypeInfo)
:::
因为类的 [MixinData](#MixinData) 中的所有父类数据中的`rootptr`都指向真正的类的数据，所以才能在类型转换过程中能找到原始的数据，然后通过 [TypeInfo](#TypeInfo) 的帮助，自由的在接口和类型树中进行转换。下面我们看看 [TypeInfo](#TypeInfo) 是怎样进行接口和类型转换的。

---
### TypeInfo 的设计 {#TypeInfo}
[TypeInfo](#TypeInfo) 的结构如下：
```zig
pub const VtableFunc = *const fn (ifacename: []const u8) ?*IObject.Vtable;
pub const SuperPtrFunc = *const fn (rootptr: *anyopaque, typename: []const u8) ?*anyopaque;
pub const TypeInfo = struct {
    typename: []const u8,
    getVtable: VtableFunc,
    getSuperPtr: SuperPtrFunc,
    ...
}
```
:::info 说明
- typename: `rootptr`指向的对象的类型名
- getVtable: 给出接口名，返回接口 `Vtable` 的函数
- getSuperPtr: 给出`rootptr`和类名，返回指向类数据指针的函数。
  
例子：
```zig
const t = std.testing;
var o = try SubChild.new(t.allocator);
defer o.destroy();
const ptr1 = o.mixin.meta.?.typeinfo.?.getSuperPtr(o.mixin.meta.?.rootptr.?, @typeName(Base)).?;
const ptr2 = &o.mixin.data.mymod_Child.mixin.data.mymod_Base;
try t.expect(@intFromPtr(ptr1) == @intFromPtr(ptr2));

const iobj = o.as(zoop.IObject).?;
const vptr = o.mixin.meta.?.typeinfo.?.getVtable(@typeName(zoop.IObject)).?;
try t.expect(@intFromPtr(iobj.vptr) == @intFromPtr(vptr));
```
:::

---
### DefVtable 的原理 {#DefVtable}
[DefVtable](#DefVtable) 的申明如下：
```zig
pub fn DefVtable(comptime Iface: type, comptime APIs: type) type
```
假如有如下 `Interface` 定义：
```zig{3-5}
pub const ISome = struct {
    pub const extends = .{IBase1, IBase2};
    pub const Vtable = zoop.DefVtable(ISome, struct {
        someFunc: *const fn(*anyopaque) void,
    });
}
```
高亮部分实际工作的伪代码如下 (假设 *usingnamespace* 能引入 *struct field*)：
```zig
pub const Vtable = struct {
    pub usingnamespace IBase1.Vtable;
    pub usingnamespace IBase2.Vtable;
    someFunc: *const fn(*anyopaque) void,
}
```
---
### Api 的原理 {#Api}
[Api](#Api) 的申明如下：
```zig
pub fn Api(comptime I: type) type
```
假如有如下`Interface`的定义:
```zig
pub const IBase = struct {
    pub usingnamespace zoop.Api(@This());
    ...
    pub fn Api(comptime I: type) type {
        return struct {
            pub fn baseFunc1(self: I) void { _ = self; }
            pub fn baseFunc2(self: I) void { _ = self; }
        }
    }
}

pub const IChild = struct {
    pub usingnamespace zoop.Api(@This());
    ...
    pub fn Api(comptime I: type) type {
        return struct {
            pub fn childFunc(self: I) void { _ = self; }
        }
    }
}
```
通过 [zoop.Api](zoop#Api) 的计算，上面的代码等价于：
```zig
pub const IBase = struct {
    ...
    pub fn baseFunc1(self: IBase) void { _ = self; }
    pub fn baseFunc2(self: IBase) void { _ = self; }
}

pub const IChild = struct {
    ...
    pub fn baseFunc1(self: IChild) void { _ = self; }
    pub fn baseFunc2(self: IChild) void { _ = self; }
    pub fn childFunc(self: IChild) void { _ = self; }
}
```

---
### Fn 的原理 {#Fn}
[Fn](#Fn) 的申明如下：
```zig
pub fn Fn(comptime T: type) type
```
假如有如下`Class`的定义:
```zig
pub const Base = struct {
    pub usingnamespace zoop.Fn(@This());
    ...
    pub fn someFunc(self: *Base) void { _ = self; }
    pub fn Fn(comptime T: type) type {
        return zoop.Method(.{
            struct {
                pub fn baseFunc(this: *T) void { _ = this; }
            },
        });
    }
};

pub const Child = struct {
    pub const extends = .{Base};
    pub usingnamespace zoop.Fn(@This());
    ...
    pub fn Fn(comptime T: type) type {
        return zoop.Method(.{
            struct {
                pub fn childFunc(this: *T) void { _ = this; }
            },
        });
    }
}
```
通过 [zoop.Fn](zoop#Fn) 的计算，上面的代码最终等价于：
```zig
pub const Base = struct {
    ...
    pub fn someFunc(self: *Base) void { _ = self; }
    pub fn baseFunc(this: *Base) void { _ = this; }
}

pub const Child = struct {
    ...
    pub fn baseFunc(this: *Child) void { _ = this; }
    pub fn childFunc(this: *Child) void { _ = this; }
}
```
:::tip 注意
- 注意到 *Base.someFunc* 没有被 *Child* 继承，因为只有定义在 [Fn](#Fn) 中的方法才参与继承。

- 注意到 *Base.someFunc* 第一个参数叫 *self* 而其它 [Fn](#Fn) 中的函数第一个参数叫 *this* ，这是个建议规范，方便在带 *this* 的函数中，仍然能定义 *self* 指向函数实现所在的`Class`

- [zoop.Method](zoop#Method) 实际上就是 [tuple.Init](tuple#Init) 的别名而已。
:::