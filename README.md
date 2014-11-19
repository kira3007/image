## Getting started
First download and install [GraphicsMagick](http://www.graphicsmagick.org/)
由于图片的比较、裁剪、拼接都是通过GraphicsMagick来完成（node下，利用gm来调用），因此，请确保先安装该软件。

##图片只能是png格式，需要编号
处理的图片必须是有序的，即##1.png，##2.png，...，##n.png

##开启服务
服务默认使用8092端口

```Bash
cd image
node index.js
```

##使用步骤
1、选择任意数量的图片，或者文件夹，拖拽到虚线框中<br>
2、点击上传<br>
3、长传完后，等待处理，点击DEMO，即可查看动画效果<br>
