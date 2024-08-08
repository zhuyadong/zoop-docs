# 简介
`zoop` 的 API 包含如下几个部分：

## `zoop`
提供基本的函数用来实现 *zig* 中的 OOP 机制。

## `zoop.tuple`
为`zoop`提供操作元组数据的能力，`zoop`利用它来组合类，接口内部的各种定义形成新的类和接口。

## `IObject`
所有通过`zoop`定义的类，都会自动实现`IObject`接口，

## `class`
所有通过`zoop`定义的类，都包含的一些基本方法。