#include <bits/stdc++.h>

using namespace std;
typedef long long ll;
struct event {
    string ts, user_hash;
    int x=-1, y=-1, color=-1;
    long long ms;
};

vector<event> events;
inline event split(string s) {
    stringstream ss(s);
    event e;
    string s1;
    getline(ss, s1, ',');
    e.ts = s1;
    getline(ss, s1, ',');
    e.user_hash = s1;
    getline(ss, s1, ',');
    if (!s1.empty()) e.x=stoi(s1);
    getline(ss, s1, ',');
    if (!s1.empty()) e.y = stoi(s1);
    getline(ss, s1, ',');
    if (!s1.empty()) e.color = stoi(s1);
    return e;
}

int main() {
    ifstream file("place_tiles.csv");
    string line;
    ll cnt=0;
    while (getline(file, line)) {
        if (cnt>100000) break;
        cnt++;
        if (cnt==1) continue;
        events.push_back(split(line));
    }
    /*for (int i=0; i<events.size(); i++) {
        cout << events[i].ts << " " << events[i].user_hash << " " << events[i].x << " " << events[i].y << " " << events[i].color << endl;
    }*/
}