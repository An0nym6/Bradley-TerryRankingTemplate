#include <iostream>
#include <cmath>
#include <ctime>
using namespace std;

int players[100];
double prediction[100];
double buffer[100];

void createPlayers() {
    // cout << "Players:" << endl;
    for (int i = 0; i < 100; i++) {
        players[i] = rand() % 100;
        // cout << "#" << i << " value: " << players[i] << endl;
    }
    for (int i = 0; i < 100; i++)
        prediction[i] = 100;
}

int matches[100][100];

void createMatches() {
    // cout << "Matches:" << endl;
    for (int i = 0; i < 100; i++)
        for (int j = 0; j < 100; j++)
            matches[i][j] = 0;
    for (int i = 0; i < 100; i++) {
        for (int j = 0; j < i; j++) {
            for (int k = 0; k < 100; k++) {
                if (rand() % (players[i] + players[j]) < players[i]) {
                    matches[i][j]++;
                    // cout << i << " beats " << j << endl;
                } else {
                    matches[j][i]++;
                    // cout << j << " beats " << i << endl;
                }
            }
        }
    }
}

void predict() {
    int loopCount = 10;
    while (loopCount--) {
        for (int i = 0; i < 100; i++) {
            double bijSum = 0, bijPlusBjiSum = 0;
            for (int j = 0; j < 100; j++) {
                if (i != j) {
                    bijSum += matches[i][j];
                    bijPlusBjiSum += (double)(matches[i][j] + matches[j][i]) /
                                     (double)(prediction[i] + prediction[j]);
                }
            }
            buffer[i] = (double)bijSum / (double)bijPlusBjiSum;
        }
        for (int i = 0; i < 100; i++)
            prediction[i] = buffer[i];
    }
}

void result() {
    for (int i = 0; i < 100; i++)
        cout << "#" << i << " " << players[i] << " " << prediction[i]
             << " " << (double)players[i] / (double)prediction[i] << endl;
}

int main() {
    createPlayers();
    createMatches();
    predict();
    result();
    return 0;
}
