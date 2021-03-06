# 基于 MM 算法对 BT 模型的排序

## 一、前言

现实生活中个体间的差异与优劣往往是以两两比对的形式进行，但是两个个体间的比对有时候会出现如下的困境：设想有下面这一种循环的情况， a 个体战胜了 b 个体，而 b 个体又战胜了 c 个体，且 c 个体战胜了 a 个体，它们的实力应该如何评估呢?又设想一下我们的跆拳道比赛，足球比赛，胜负输赢情况繁复，我们又以怎样的标准来评估各个体的实力值呢?

简单来说，我们完成的是一个基于 Mongo DB 和 Node.js 的后端框架，提供 API 用于实现这种两两比对之后的实力值评估。

## 二、问题定义

### 1、输入

我们程序的输入包含每场比赛的输赢情况：比如记录了三场赛事， a 战胜 了 b ， a 战胜了 c ， b 战胜了 c ，那么我们只需要提供一串包含这些比赛信息的字符串“0 a b|1 a c|2 b c”作为输入即可，数字表示比赛的 ID 号，重复提交相同 ID 的比赛，后一个数据项会覆盖前一个数据项。当然，我们也提供删除比赛的 API ，如果想删除比赛 0 ， 1 和 4 ，那么我们只需要提供字符串“0|1|4”即可。输入方式为将上述指定的字符串通过 POST 的方式发送到服务器对于 URL 即可。

具体来说，想要添加比赛的输赢情况， POST 上述规定的字符串到“/add”;想要删除比赛的输赢情况， POST 上述规定的字符串到“/delete”。

### 2、输出

我们程序的输出包含了各个个体的实力值，格式为 JSON 。

也许这么解释会过于的抽象，更多的信息请参考我们已经完成的一个前端的 Demo 源码，里面使用了每一条 API 指令，并有详细的注释。

## 三、算法描述

我们设计的思想来自于围棋 AI 的选子算法，所参考的论文是《Factorization Ranking Model for Move Prediction in the Game of Go》。在论文中，作者利用 MM 算法构建了一个排序算法来对复杂化的 BT 模型(也就是论文中的 FBT 模型)进行排序。

### 1、知识铺垫

#### 1.1 BT 模型

BT 模型是一种用来预测比较结果的概率模型，全称是 Bradley-Terry 模型。下面我将举出一个形象化的例子，假设有两个个体 i 和 j ， Pi 和 Pj 分别表示这两个个体的实力值，那么在一次比赛中， i 战胜 j 的概率就可以用下面这个式子来表示：

![img1](http://liuren.link/images/22.png)

事实上， BT 模型可以有很多参数化的表示，比如我们可以用 e 的 n 次幂的形式来替代简单的线性形式：

![img2](http://liuren.link/images/23.png)

BT 模型之所以那么构建，有着严谨的数据论证[1]，这里不再赘述。

#### 1.2 MM 算法

MM 算法准确来说不是一种算法，它其实是对如何得出优秀算法的一种描述。 MM 是 majorize/minimize 或者 minorize/maximize 的缩写，两者的区别仅在于一个试图求出最大值，一个试图求出最小值，两者所用到的方法是完全相同的，下面我将以 minorize/maximize 为例，简单地介绍一下 MM 算法：

    如果存在一个函数 M(𝜃|𝜃m) 满足：

    对于所有的 𝜃 ，有 M(𝜃|𝜃m) ≤ 𝑓(𝜃) 且 M(𝜃|𝜃m) =𝑓(𝜃m)

那么我们就称它 minorize 了函数 𝑓(𝜃) 。

此时，我们取出函数 M(𝜃|𝜃m) 的最大值 𝜃m+1 ，并在该点构建新的函数 M(𝜃|𝜃m+1) 以此不断地迭代， 𝜃m 将会趋于函数 𝑓(𝜃) 的最大值，我们的目的也便达成。我们再来用一张图来表示这个具体的过程：

![img3](http://liuren.link/images/24.jpg)

但是读者可能会问了，求函数的最值何必那么复杂呢，求出函数的导数画出函数的图像不就可以十分精确地求出极大值了么?诚然，对于一些简单的函数比如初等函数或是初等函数的复函数我们确实可以通过求导的方式轻松地解决最值问题，但是如果一个函数是离散的，甚至说一个函数的自变量根本不是一个数，那么它的导数也便无从定义了。在我们的算法中， 𝜃 便不是一个数字，你可以将其看做是一个高维的向量，或者是数的集合，这个时候我们需要用 MM 算法不断迭代，以求出近似的最值。

#### 1.3 超平面上的凸函数

超平面是 n 维欧氏空间中余维度等于一的线性子空间。这是平面中的直线、空间中的平面之推广。
它有如下性质，如果 h(x) 是一个凸函数，那么有：

![img4](http://liuren.link/images/25.png)

这里涉及到的是纯数学，其论证仍不在这里赘述[2]。

### 2、对自己算法的描述

有了上面的铺垫，我们就可以理解 MM 算法是如何对 BT 模型进行排序的了。我们假设有很多支足球队，其中有两支球队被标记为 i 和 j ，我们先假定它们的实力值为 Pi 和 Pj (在程序之初所有队伍的实力值被初始化为一个常数，经过我们的多次尝试，为了达到一个最令人舒适的结果，我们将其初始化为 100 )，那么根据我们前面提到的对 BT 模型的线性定义， i 球队战胜 j 球队的概率就可以被表示为：

![img5](http://liuren.link/images/26.png)

现在我们将这个思路拓展到任意两支球队，设置计数器 bij 为 i 战胜 j 的次数，那么一张任意的输赢表(一个历史战局，比如一场世界杯结束后所有的输赢情况，这里可能会比较难理解)就可以被表示为：

![img6](http://liuren.link/images/27.png)

众所周知，计算机的计算精度极其有限的，如果比赛场次众多，假如有 100 场比赛，其中每支队伍的实力值均相等，那么这个概率 L(𝜃) 就等于 0.5^100 ，这个数字普通的 PC 不通过特殊的算法已经很难表示，因此我们对这个概率值取对数。依赖于对数函数良好的单调性，我们只需要求出对数函数最值时的自变量即是使概率最大化的自变量。

读者可能又会问了，这样对 L(𝜃) 的表示不把一支球队自己踢自己的情况计算进去了?的确如此，所以我们需要使用算法者格外小心地维护自己的数据：一个合法的数据是不存在自己战胜自己的情况的，即 bij 为 0 ，任何数的 0 次幂均为 1 ，它并不影响求积结果。

正如上面所述，我们对 L 𝜃 取对数，并定义为 𝑓(𝜃) ，则：

![img7](http://liuren.link/images/28.png)

令 ![img8](http://liuren.link/images/29.png) ， x 仍满足我们之前的定义 x= 𝜃i +𝜃j ，带入上面 𝑓(𝜃) 的表达式，则有：

![img9](http://liuren.link/images/30.png)

这里 n 表示第 n 次迭代，并不是指 n 次幂; 𝜃ni 和 𝜃nj 是上一次的计算结果，在我们的程序中被初始化为了 100 ; 𝜃 可以被看做是一个高维的向量，或者是数的集合，而等式右侧的 𝜃i 和 𝜃j 为其中的一项。

我们对上面得到的这个 M(𝜃|𝜃n) 稍作检查，便可以发现它满足 MM 算法的要求，也就是说它 minorize 了函数 𝑓(𝜃) 。根据一些巧妙的运算，我们就可以得到 ![img10](http://liuren.link/images/31.png) ，具体的计算过程仍为数学过程，这里也不多赘述。

照此不断迭代，我们便可以得到“可能性”的最大值，这意味着什么呢?让我们再次来梳理一下逻辑：我们首先假定每支球队的实力均为 100 ，依此计算出了发生输入的这张输赢表发生的概率，然后我们通过 MM 算法不断地迭代，修改每支球队的实力值以使这张输赢表发生的概率增大，可能性越大，便可说明我们对每支队伍的实力评估越接近现实，当达到一定精度的时候，我们便可以根据实力值，得出排名。这就是利用 MM 算法对 BT 模型的排序。

## 四、实验结果

### 1、用 C / C++ 完成的简单测试

为了确保算法的有效性，我们没有十分鲁莽地直接用它来搭建服务器，而是先写了一个 C / C++ 的小程序来进行测试。我们测试的思路是这样的：

我们先用随机数产生了 100 个个体，每个个体有 0 到 99 之间整数的实力值。我们根据这个实力值利用 BT 模型来模拟比赛，比赛的输赢概率遵从 BT 模型线性形式的定义，两两个体之间比赛 100 场。

上述过程是我们程序的预处理阶段，接下来我们便用这 100 场比赛的输赢情况来评估每个个体的实力，如果我们评估出的实力与我们设定的相似，则说明我们算法是有效的。输出结果如下：

![img11](http://liuren.link/images/32.png)

输出分为四列，第一列为个体的序号，第二列为我们给它设定的实力值，第三列为我们给它的评分，第四列为个体被设定的实力值与我们给它评定的实力值的比值。我们可以看到，第四列的值稳定在 0.4 左右，说明我们对各个体实力评估是相当准确的。这里没必要展示所有的 100 项结果，所以上图仅展示其中的前 20 项。

### 2、后端框架

我们收集了最近 3 届世界杯(不含预选赛)的所有比赛数据，依次为据给
每支球队打分并排序，数据总结如下：

![img12](http://liuren.link/images/33.png)

读者可能会发现这个文件的格式并不符合论文第二部分里的定义，我们写
了一个简单的程序来转换格式，由于程序十分简单，这里也不多说。

程序的具体启动方法将在附录中进行详细的说明，这里只做展示。

![img13](http://liuren.link/images/34.png) ![img14](http://liuren.link/images/35.png)

![img15](http://liuren.link/images/36.png)

![img16](http://liuren.link/images/37.png)

演示的样例在项目的“demo/”文件夹中，确保服务器正确运行之后，双击其中的“index.html”文件即可运行网站，网站上则会显示世界杯前 10 名的排名：

![img17](http://liuren.link/images/38.png)

在这里只显示了前 10 名，如果你想知道其他球队的排名，在右上角的搜索框中搜索即可：

![img18](http://liuren.link/images/39.png)

![img19](http://liuren.link/images/40.png)

我们对比了世界足联给出的官方数据，发现我们的评分是可靠的。

最后，我们再简单的介绍一下源码[3]，以分析其实如何工作的。后端框架的代码比较复杂，也是我们程序的核心，但是它不是展示的内容，有兴趣的读者可以下载之后自行研究，我们这里只讲讲前端代码是如何工作的。

打开“demo/js/footballRank.js”，代码如下：

![img20](http://liuren.link/images/41.png)

第 5 行我们将最近三届所有世界杯输赢信息 POST 到了服务器，第 8 行 我们通过 GET 方法从服务器获取每支队伍的实力值，第 27 行开始为我们事先搜索框逻辑部分的代码。

## 五、总结

在我们日常生活中，很多比较都是两两个体之间进行的：

![img21](http://liuren.link/images/42.png) ![img22](http://liuren.link/images/43.png) ![img23](http://liuren.link/images/44.png) ![img24](http://liuren.link/images/45.png)

比如游戏中的围棋、炉石传说，体育中的足球、跆拳道等，我们应该如何对玩家或选手进行排位?如何去评估他们的实力呢?比较简单的方法有以下几个，我将一一的指出它们的缺点，并阐述为什么说我们提供的算法是可靠的。

**按照个体的胜率?**
假设有这样一种情况，一个个体仅参加过几次比赛，而他恰巧遇到的对手都是实力很弱的，假设这个个体赢得了比赛，那么他的胜率
会是 100% ，但事实上他的实力并不一定强。

**按照个体获胜的场数?**
假设有这样一种情况，围棋高手李世石和 Alpha Go 过招， Alpha Go 屡次战胜李世石，显然它的实力高过李世石，但是如果以获 胜场数来评估，李世石会被错误地评估为比 Alpha Go 更强。

**按照获胜加分?输场扣分?**
上面李世石和 Alpha Go 的例子仍能驳倒这种评分方法。

那么我们凭什么说用 MM 算法对 BT 模型排序就是极优的呢?我们还是举出一个例子来证明， Alpha Go 屡次战胜李世石说明其水平更高，尽管其参加的比赛场次数很少，在我们的算法中， Alpha Go 初始实力为 100 ，假设李世石实力已有 500， 那么 Alpha Go 战胜李世石的概率仅有 1/6 ，这并不能让概率达到较大的值，所以在迭代时为了使 BT 模型概率最大化， MM 算法会不断调高 Alpha Go 实力值以达到最优，我们的算法仅需 2、3 次就可以让 Alpha Go 实力值超越李世石，这与事实的客观实力估计是十分契合的。

## 六、附录

### 1、实验环境

我们没有进行性能方面的比较，因此我们也不详细说明电脑的配置了。我们的程序运行在一台 Macbook Pro 以及一台 Macbook Air 上，操作系统均为 OS X El Capitan 版本 10.11.5 ，使用的编辑器为 Sublime Text 3，浏览器为 Chrome。

### 2、如何运行程序

正如在第四部分中所讲的那样，我们的代码分为两个部分： C++ 的简单测试程序以及我们的后端服务器框架。

对于前者，只需要简单的编译运行即可;对于后者，想要运行起来会比较困难，但是如果电脑上已经安装过 Mongo DB 和 Node.js ，那么运行也就很简单了。 Mongo DB 和 Node.js 是目前 Web 很通用的两款工具，具体的安装过程网上提供了很多的教程，在这里也不再赘述。

安装好这两款工具后，在命令行中打开工程目录，运行“mongod -dbpath data/”，确保数据库正常运行起来之后，新建命令行窗口，运行“node index.js”即可启动服务器。

我们提供了一个 Demo 网站，在完成服务器的启动之后直接运行 Demo 的 HTML 页面即可，你可以通过浏览器的 Network 监视来进一步地了解这个网站工作的原理。

### 3、参考

* 对于 BT 模型的更多信息可以参考它的维基百科： [BT 模型](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model， "BT 模型")
* 对于超平面的更多信息可以参考它的危机百科： [超平面](https://en.wikipedia.org/wiki/Hyperplane， "超平面")
* 我们的项目代码请从 Github 上下载，如果觉得有意思的话欢迎点赞。
