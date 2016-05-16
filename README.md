# Bradley-Terry Ranking Template
A Template based on MongoDb and Bradley-Terry Ranking which could be used in various ranking situations

这是一个基于MongoDb的利用MM算法对BT模型进行排序的模板
## 5月16日
    完成了C++的实验。
    我们先产生球员，编号1到100，再产生随机的实力值作为他们客观的实力。
    再两两之间比赛100场，输赢概率根据客观实力值来定，然后我们就得到了模拟的比赛信息。
    将这个比赛信息作为输入输入到MM算法中，不断迭代得到每个球员被估计的实力。
    再比较估计的实力与客观的实力的比值，发现它稳定在一个常数，就说明算法的评估是很准确的。