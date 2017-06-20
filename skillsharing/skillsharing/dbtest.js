var level = require('level');
var db = level('./mydb'); //这里的路径就是物理存储数据的文件路径,建议不要放到项目中.

// put a key & value
	db.put('name', 'Level', function (err) {
  		if (err) return console.log('Ooops!', err) // some kind of I/O error

  		// fetch by key
  	db.get('name', function (err, value) {
    	if (err) return console.log('Ooops!', err) // likely the key was not found

    	// ta da!
    	console.log('name=' + value)
  	})
})