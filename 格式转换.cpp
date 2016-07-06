#include <iostream>
#include <string>
using namespace std;

int main() {
    freopen("in.txt", "r", stdin);
    string winner, loser;
    int i = 0;
    while (cin >> winner >> loser) {
        cout << i << " " << winner << " " << loser << "|";
        i++;
    }
}