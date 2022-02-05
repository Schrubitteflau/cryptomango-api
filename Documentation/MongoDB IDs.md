On peut laisser Mongoose générer les IDs uniques de documents car on connaît comment sont générés les IDs dans MongoDB :
- https://docs.mongodb.com/manual/reference/method/ObjectId/
- https://stackoverflow.com/questions/17899750/how-can-i-generate-an-objectid-with-mongoose

Plusieurs variables entrent en jeu :
- le temps
- une valeur unique par processus et par machine
- une valeur pseudo-aléatoire

On ne doit donc pas craindre une éventuelle collision, d'autant que le nombre de documents au sein d'une collection ne sera pas démentiel : on les comptera en millions.

```
If you generate 16777216 within one (milli ?)second on the same machine, then you will probably get a duplicate
```
