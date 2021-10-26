class Puyo {
  constructor() {
    this.clearField();
    this.clearCheckField();
  }

  clearField() {
    this.field = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
  }

  clearCheckField() {
    this.checkField = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
  }

  placePuyo(colnum, puyo) {
    let col = this.field[colnum - 1]
    for (var i = 0; i < col.length; i++) {
      if (col[i] != 0) {
        col[i - 1] = puyo;
        break;
      }
      if (i == col.length - 1) {
        col[i] = puyo;
        break;
      }
    }
    return this;
  }

  debug() {
    return false;
  }

  cloneField(field) {
    let backup = [];
    for (var i = 0; i < field.length; i++) {
      backup.push(field[i].concat());
    }
    return backup;
  }

  isFieldClear(field = this.field) {
    for (var r = 0; r < field[0].length; r++) {
      for (var c = 0; c < field.length; c++) {
        if (field[c][r] != 0) {
          return false;
        }
      }
    }
    return true;
  }

  tryPattern(idx, tsumos, field, moves = []) {
    this.tries++;
    if (this.tries % 1000 == 0) {
      console.log(`tries: ${this.tries}`)
    }
    let tsumo = tsumos[idx];
    let results = this.bruteForce(tsumo[0], tsumo[1], field, moves);
    let self = this;
    if (idx == tsumos.length - 1) {
      return results;
    }
    var lastResults = [];
    results.filter(function(result) {
      return result.rensa.length == 0;
    }).forEach(function(result) {
      let newMoves = moves.concat();
      newMoves.push(result.place);
      lastResults.push(self.tryPattern(idx + 1, tsumos, result.field, newMoves));
    });
    return lastResults;
  }

  tryPatternLoop(idx, tsumos, field, moves = []) {
    this.tries++;
    if (this.tries % 1000 == 0) {
      console.log(`tries: ${this.tries}`)
    }
    let tsumo = tsumos[idx];
    return this.bruteForce(tsumo[0], tsumo[1], field, moves);
  }

  nazoPuyoLoop(tsumos, condition) {
    this.tries = 0;
    var field = this.field;
    let self = this;
    var idx = 0;
    let stack = [];
    let lastResults = [];
    var results = null;

    while (true) {
      while (idx < tsumos.length) {
        if (results == null) {
          results = this.tryPatternLoop(idx, tsumos, field)
        }
        if (idx == tsumos.length) {
          lastResults.push(results);
          break;
        }
        var result = results.pop();
        if (result) {
          field = result.field;
          stack.push(results);
        }
        idx++;
      }
      results = stack.pop();
      if (results) {
        result = results.pop();
        if (result) {
          field = result.field;
        }
      }
      idx--;
      if (idx == 0) {
        break;
      }
      if (this.tries > 10000) {
        break;
      }
    }
  }

  nazoPuyo(tsumos, condition) {
    this.tries = 0;
    var field = this.field;
    let self = this;
    var lastResults = this.tryPattern(0, tsumos, field);
    for (var i = 0; i < tsumos.length; i++) {
      lastResults = Array.prototype.concat.apply([], lastResults);
    }
    let answers = lastResults.filter(function(result) {
      let hanteis = [];
      if (condition.rensa && condition.rensa == result.rensa.length) {
        hanteis.push(true);
      }
      if (condition.zenkeshi && this.isFieldClear(result.field)) {
        hanteis.push(true);
      }
      if (condition.doujikeshi) {
        result.rensa.forEach(function(deletion) {
          var doujikeshi = 0;
          deletion.forEach(function(rensa) {
            doujikeshi += rensa.renketsu;
          });
          if (condition.doujikeshi == doujikeshi) {
            hanteis.push(true);
          }
        });
      }
      return hanteis.length && hanteis.every(function(hantei) { return hantei; });
    });
    console.log(answers);
    if (answers.length) {
      this.showAnswers(answers);
    } else {
      alert('can not find answer.')
    }
  }

  showAnswers(answers) {
    let answersTag = $('#ansers').empty();
    answers.forEach((answer, idx) => {
      $('<div/>').attr('id', `answer_${idx}`).appendTo(answersTag);
      this.showField(answer.beforeField, `#answer_${idx}`)
      let ol = $('<ol/>');
      let allMoves = answer.moves.concat();
      allMoves.push(answer.place);
      allMoves.forEach((move) => {
        $('<li/>').text(`${move.column} ${move.o}`).appendTo(ol);
      })
      answersTag.append(ol);
    })
  }

  bruteForce(jiku, o, field, moves) {
    let backup = this.cloneField(field);
    let results = [];
    // tate
    for (var i = 0; i < backup.length; i++) {
      this.field = this.cloneField(backup);
      this.placePuyo(i + 1, jiku).placePuyo(i + 1, o);
      var pattern = {
        tsumo: [jiku, o],
        place: {column: i + 1, o: 'up'},
        beforeField: this.cloneField(this.field),
        moves: moves,
      }
      var rensa = this.rensa();
      pattern.rensa = rensa;
      pattern.field = this.field;
      results.push(pattern);

      // skip zoro
      if (jiku == o) {
        continue;
      }

      this.field = this.cloneField(backup);
      this.placePuyo(i + 1, o).placePuyo(i + 1, jiku);
      pattern = {
        tsumo: [jiku, o],
        place: {column: i + 1, o: 'down'},
        beforeField: this.cloneField(this.field),
        moves: moves,
      }
      var rensa = this.rensa();
      pattern.rensa = rensa;
      pattern.field = this.field;
      results.push(pattern);
    }
    // yoko
    for (var i = 0; i < backup.length - 1; i++) {
      this.field = this.cloneField(backup);
      this.placePuyo(i + 1, jiku).placePuyo(i + 2, o);
      var pattern = {
        tsumo: [jiku, o],
        place: {column: i + 1, o: 'right'},
        beforeField: this.cloneField(this.field),
        moves: moves,
      }
      var rensa = this.rensa();
      pattern.rensa = rensa;
      pattern.field = this.field;
      results.push(pattern);

      // skip zoro
      if (jiku == o) {
        continue;
      }

      this.field = this.cloneField(backup);
      this.placePuyo(i + 2, jiku).placePuyo(i + 1, o);
      var pattern = {
        tsumo: [jiku, o],
        place: {column: i + 2, o: 'left'},
        beforeField: this.cloneField(this.field),
        moves: moves,
      }
      var rensa = this.rensa();
      pattern.rensa = rensa;
      pattern.field = this.field;
      results.push(pattern);
    }
    return results;
  }

  showField(field = this.field, selector = '#field') {
    let fieldTag = $(selector).empty();
    let table = $('<table/>');
    for (var r = 0; r < field[0].length; r++) {
      let tr = $('<tr/>');
      for (var c = 0; c < field.length; c++) {
        let currentPuyo = field[c][r];
        let td = $('<td/>');
        if (currentPuyo == 'g') {
          td.append($('<img/>').attr('src', 'http://ips.karou.jp/simu/img/g.gif'))
        } else if (currentPuyo == 'b') {
          td.append($('<img/>').attr('src', 'http://ips.karou.jp/simu/img/b.gif'))
        } else if (currentPuyo == 'r') {
          td.append($('<img/>').attr('src', 'http://ips.karou.jp/simu/img/r.gif'))
        } else if (currentPuyo == 'y') {
          td.append($('<img/>').attr('src', 'http://ips.karou.jp/simu/img/y.gif'))
        } else if (currentPuyo == 'p') {
          td.append($('<img/>').attr('src', 'http://ips.karou.jp/simu/img/p.gif'))
        } else if (currentPuyo == 'o') {
          td.append($('<img/>').attr('src', 'http://ips.karou.jp/simu/img/o.gif'))
        }
        tr.append(td);
      }
      table.append(tr);
    }
    fieldTag.append(table);
  }

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  oneRensa() {
    this.clearCheckField();
    this.checkRenketsu()
    if (this.debug()) {
      this.printDebug();
    }
    let deletion = this.deletePuyo();
    if (deletion.length) {
      this.dropPuyo();
    }
    return deletion;
  }

  rensa() {
    let rensa = [];
    var deletion = [];
    do {
      deletion = this.oneRensa();
      if (deletion.length) {
        rensa.push(deletion);
      }
    } while (deletion.length)
    return rensa;
  }

  dropPuyo() {
    for (var c = 0; c < this.field.length; c++) {
      for (var r = 0; r < this.field[0].length; r++) {
        let currentPuyo = this.field[c][r];
        if (currentPuyo == 0) {
          this.field[c].splice(r, 1);
          this.field[c].unshift(0);
        }
      }
    }
  }

  deleteSection(c, r, section) {
    let currentPuyo = this.field[c][r];
    this.field[c][r] = 0;
    section.renketsu++;
    // up
    if (r >= 1) {
      if (currentPuyo == this.field[c    ][r - 1]) {
        this.deleteSection(c, r  - 1, section);
      } else if (this.field[c][r - 1] == 'o' /* ojyama */) {
        this.field[c][r - 1] = 0;
      }
    }
    // right
    if (c < this.field.length - 1) {
      if (currentPuyo == this.field[c + 1][r    ]) {
        this.deleteSection(c + 1, r, section);
      } else if (this.field[c + 1][r] == 'o' /* ojyama */) {
        this.field[c + 1][r] = 0;
      }
    }
    // down
    if (r < this.field[0].length) {
      if (currentPuyo == this.field[c    ][r + 1]) {
        this.deleteSection(c, r + 1, section);
      } else if (this.field[c][r + 1] == 'o' /* ojyama */) {
        this.field[c][r + 1] = 0;
      }
    }
    // left
    if (c >= 1) {
      if (currentPuyo == this.field[c - 1][r    ]) {
        this.deleteSection(c - 1, r, section);
      } else if (this.field[c - 1][r] == 'o' /* ojyama */) {
        this.field[c - 1][r] = 0;
      }
    }
  }

  deletePuyo() {
    let deletion = [];
    for (var c = 0; c < this.field.length; c++) {
      for (var r = 0; r < this.field[0].length; r++) {
        let currentPuyo = this.field[c][r];
        if (currentPuyo == 0 || currentPuyo == 'o' /* ojyama */) {
          continue;
        }
        let renketsu = this.checkField[c][r];
        if (renketsu <= 1) {
          continue;
        }
        let section = {
          puyo: currentPuyo,
          renketsu: 0,
        };
        // up
        if (r >= 1) {
          if (currentPuyo == this.field[c    ][r - 1]) {
            let nearRenketsu = this.checkField[c][r - 1];
            if (nearRenketsu + renketsu >= 4) {
              this.deleteSection(c, r, section);
            }
          }
        }
        // right
        if (c < this.field.length - 1) {
          if (currentPuyo == this.field[c + 1][r    ]) {
            let nearRenketsu = this.checkField[c + 1][r    ];
            if (nearRenketsu + renketsu >= 4) {
              this.deleteSection(c, r, section);
            }
          }
        }
        // down
        if (r < this.field[0].length) {
          if (currentPuyo == this.field[c    ][r + 1]) {
            let nearRenketsu = this.checkField[c    ][r + 1];
            if (nearRenketsu + renketsu >= 4) {
              this.deleteSection(c, r, section);
            }
          }
        }
        // left
        if (c >= 1) {
          if (currentPuyo == this.field[c - 1][r    ]) {
            let nearRenketsu = this.checkField[c - 1][r    ];
            if (nearRenketsu + renketsu >= 4) {
              this.deleteSection(c, r, section);
            }
          }
        }
        if (section.renketsu) {
          deletion.push(section);
        }
      }
    }
    return deletion;
  }

  checkRenketsu() {
    this.clearCheckField();
    for (var c = 0; c < this.field.length; c++) {
      for (var r = 0; r < this.field[0].length; r++) {
        let currentPuyo = this.field[c][r];
        if (currentPuyo == 0 || currentPuyo == 'o' /* ojyama */) {
          continue;
        }
        let renketsu = 0
        // up
        if (r >= 1) {
          if (currentPuyo == this.field[c    ][r - 1]) {
            renketsu++;
          }
        }
        // right
        if (c < this.field.length - 1) {
          if (currentPuyo == this.field[c + 1][r    ]) {
            renketsu++;
          }
        }
        // down
        if (r < this.field[0].length) {
          if (currentPuyo == this.field[c    ][r + 1]) {
            renketsu++;
          }
        }
        // left
        if (c >= 1) {
          if (currentPuyo == this.field[c - 1][r    ]) {
            renketsu++;
          }
        }
        this.checkField[c][r] = renketsu;
      }
    }
  }

  printDebug() {
    for (var r = 0; r < this.field[0].length; r++) {
      let line = `${('00' + r).slice(-2)}: `;
      let check = '';
      for (var c = 0; c < this.field.length; c++) {
        line += this.field[c][r];
        check += this.checkField[c][r];
      }
      console.log(`${line} | ${check}`);
    }
  }
  printField() {
    for (var r = 0; r < this.field[0].length; r++) {
      let line = `${('00' + r).slice(-2)}: `;
      for (var c = 0; c < this.field.length; c++) {
        line += this.field[c][r];
      }
      console.log(line);
    }
  }

  printCheckField() {
    for (var r = 0; r < this.checkField[0].length; r++) {
      let line = `${('00' + r).slice(-2)}: `;
      for (var c = 0; c < this.checkField.length; c++) {
        line += this.checkField[c][r];
      }
      console.log(line);
    }
  }
}
