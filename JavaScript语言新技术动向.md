# JavaScript语言新技术动向

- async/await
- web socket

## Async/Await

​	构建一个应用程序总是会面对异步调用，不论是在 Web 前端界面，还是 Node.js 服务端都是如此，JavaScript 里面处理异步调用一直是非常恶心的一件事情。以前只能通过回调函数，后来渐渐又演化出来很多方案，最后 Promise 以简单、易用、兼容性好取胜，但是仍然有非常多的问题。其实 JavaScript 一直想在语言层面彻底解决这个问题，在 ES6 中就已经支持原生的 Promise，还引入了 Generator 函数，终于在 ES7 中决定支持 async 和 await。

![img](http://img2.tuicool.com/my6rYv.png!web)

#### 基本语法

​	async/await 究竟是怎么解决异步调用的写法呢？简单来说，就是将异步操作用同步的写法来写。先来看下最基本的语法（ES7 代码片段）：

```javascript
const f = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(123);
    }, 2000);
  });
};

const testAsync = async () => {
  const t = await f();
  console.log(t);
};

testAsync();
```

​	首先定义了一个函数 `f` ，这个函数返回一个 Promise，并且会延时 2 秒， `resolve` 并且传入值 123。 `testAsync` 函数在定义时使用了关键字 `async` ，然后函数体中配合使用了 `await` ，最后执行 `testAsync` 。整个程序会在 2 秒后输出 123，也就是说 `testAsync` 中常量 `t` 取得了`f` 中 `resolve` 的值，并且通过 `await` 阻塞了后面代码的执行，直到 `f` 这个异步函数执行完。

#### 对比 Promise

​	仅仅是一个简单的调用，就已经能够看出来 async/await 的强大，写码时可以非常优雅地处理异步函数，彻底告别回调恶梦和无数的 `then` 方法。我们再来看下与 Promise 的对比，同样的代码，如果完全使用 Promise 会有什么问题呢？

```javascript
const f = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(123);
    }, 2000);
  });
};

const testAsync = () => {
  f().then((t) => {
    console.log(t);
  });
};

testAsync();
```

​	从代码片段中不难看出 Promise 没有解决好的事情，比如要有很多的 `then` 方法，整块代码会充满 Promise 的方法，而不是业务逻辑本身，而且每一个 `then` 方法内部是一个独立的作用域，要是想共享数据，就要将部分数据暴露在最外层，在 `then` 内部赋值一次。虽然如此，Promise 对于异步操作的封装还是非常不错的，所以 `async/await` 是基于 Promise 的， `await` 后面是要接收一个 Promise 实例。

#### 对比 RxJS

​	RxJS 也是非常有意思的东西，用来处理异步操作，它更能处理基于流的数据操作。举个例子，比如在 Angular2 中 http 请求返回的就是一个 RxJS 构造的 Observable Object，我们就可以这样做：

```javascript
$http.get(url)
  .map(function(value) {
    return value + 1;
  })
  .filter(function(value) {
    return value !== null;
  })
  .forEach(function(value) {
    console.log(value);
  })
  .subscribe(function(value) {
    console.log('do something.');
  }, function(err) {
    console.log(err);
  });
```

​	如果是 ES6 代码可以进一步简洁：

```javascript
$http.get(url) 
  .map(value => value + 1) 
  .filter(value => value !== null) 
  .forEach(value => console.log(value)) 
  .subscribe((value) => { 
    console.log('do something.'); 
  }, (err) => { 
    console.log(err); 
  });
```

​	可以看出 RxJS 对于这类数据可以做一种类似流式的处理，也是非常优雅，而且 RxJS 强大之处在于你还可以对数据做取消、监听、节流等等的操作，这里不一一举例了，感兴趣的话可以去看下 RxJS 的 API。

​	这里要说明一下的就是 RxJS 和 async/await 一起用也是可以的，Observable Object 中有 `toPromise` 方法，可以返回一个 Promise Object，同样可以结合 `await` 使用。当然你也可以只使用 async/await 配合 underscore 或者其他库，也能实现很优雅的效果。总之，RxJS 与 async/await 不冲突。

#### 异常处理

​	通过使用 async/await，我们就可以配合 try/catch 来捕获异步操作过程中的问题，包括 Promise 中 reject 的数据。

```javascript
const f = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(234);
    }, 2000);
  });
};

const testAsync = async () => {
  try {
    const t = await f();
    console.log(t);
  } catch (err) {
    console.log(err);
  }
};

testAsync();
```

​	代码片段中将 `f` 方法中的 `resolve` 改为 `reject` ，在 `testAsync` 中，通过 `catch` 可以捕获到 `reject` 的数据，输出 err 的值为 234。 `try/catch` 使用时也要注意范围和层级。如果`try` 范围内包含多个 `await` ，那么 `catch` 会返回第一个 `reject` 的值或错误。

```javascript
const f1 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(111);
    }, 2000);
  });
};

const f2 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(222);
    }, 3000);
  });
};

const testAsync = async () => {
  try {
    const t1 = await f1();
    console.log(t1);
    const t2 = await f2();
    console.log(t2);
  } catch (err) {
    console.log(err);
  }
};

testAsync();
```

​	如代码片段所示， `testAsync` 函数体中 `try` 有两个 `await` 函数，而且都分别 `reject` ，那么 `catch` 中仅会触发 `f1` 的 `reject` ，输出的 err 值是 111。



## web socket

​	WebSocket是HTML5开始提供的一种浏览器与服务器间进行全双工通讯的网络技术。WebSocket的标准在 RFC 6455中,WebSocketAPI被W3C定为标准。

#### WEB Socket属性

|          属性           |                    说明                    |
| :-------------------: | :--------------------------------------: |
|   Socket.readyState   | readyState的代表的ReadOnly属性的连接状态。它可以有以下值：一个0值表示该连接尚未建立。值为1表示连接建立和沟通是可能的。值为2表示连接是通过将结束握手。值为3表示连接已关闭或无法打开。 |
| Socket.bufferedAmount | 读属性的bufferedAmount代表文本的字节数,UTF - 8的排队使用send()方法。 |



#### WEB Socket事件：

| 事件      | 处理程序             | 说明                    |
| ------- | ---------------- | --------------------- |
| open    | Socket.onopen    | 此事件发生在套接字建立连接。        |
| message | Socket.onmessage | 此事件发生时，客户端收到来自服务器的数据。 |
| error   | Socket.onerror   | 此事件发生时有任何通信错误。        |
| close   | Socket.onclose   | 此事件发生在连接关闭。           |



#### WEB Socket方法：

| 方法             | 说明                      |
| -------------- | ----------------------- |
| Socket.send()  | send（data）方法用来连接传输数据。   |
| Socket.close() | close（）方法将被用于终止任何现有的连接。 |

#### 详细代码案例

```javascript
//检查浏览器是否支持WebSocket
    if(window.WebSocket){
        console.log('This browser supports WebSocket');
    }else{
        console.log('This browser does not supports WebSocket');
    }
```

```javascript
<!DOCTYPE html>  
<meta charset="utf-8" />  
<title>WebSocket Test</title>  
<script language="javascript"type="text/javascript">  
    var wsUri ="ws://echo.websocket.org/"; 
    var output;  
    
    function init() { 
        output = document.getElementById("output"); 
        testWebSocket(); 
    }  
 
    function testWebSocket() { 
        websocket = new WebSocket(wsUri); 
        websocket.onopen = function(evt) { 
            onOpen(evt) 
        }; 
        websocket.onclose = function(evt) { 
            onClose(evt) 
        }; 
        websocket.onmessage = function(evt) { 
            onMessage(evt) 
        }; 
        websocket.onerror = function(evt) { 
            onError(evt) 
        }; 
    }  
 
    function onOpen(evt) { 
        writeToScreen("CONNECTED"); 
        doSend("WebSocket rocks"); 
    }  
 
    function onClose(evt) { 
        writeToScreen("DISCONNECTED"); 
    }  
 
    function onMessage(evt) { 
        writeToScreen('<span style="color: blue;">RESPONSE: '+ evt.data+'</span>'); 
        websocket.close(); 
    }  
 
    function onError(evt) { 
        writeToScreen('<span style="color: red;">ERROR:</span> '+ evt.data); 
    }  
 
    function doSend(message) { 
        writeToScreen("SENT: " + message);  
        websocket.send(message); 
    }  
 
    function writeToScreen(message) { 
        var pre = document.createElement("p"); 
        pre.style.wordWrap = "break-word"; 
        pre.innerHTML = message; 
        output.appendChild(pre); 
    }  
 
    window.addEventListener("load", init, false);  
</script>  
<h2>WebSocket Test</h2>  
<div id="output"></div>  
</html>
```

#### 主要代码解读

1. ##### 申请一个WebSocket对象

   ​	参数是需要连接的服务器端的地址，同http协议使用http://开头一样，WebSocket协议的URL使用ws://开头，另外安全的WebSocket协议使用wss://开头。

   ```javascript
   var wsUri ="ws://echo.websocket.org/";
   websocket = new WebSocket(wsUri);
   ```

2. ##### WebSocket对象一共支持四个消息 onopen, onmessage, onclose和onerror

   ​	我们可以看出所有的操作都是采用消息的方式触发的，这样就不会阻塞UI，使得UI有更快的响应时间，得到更好的用户体验。

   ​	（1）当Browser和WebSocketServer连接成功后，会触发onopen消息;

   ```javascript
   websocket.onopen = function(evt) {};
   ```

   ​	（2）如果连接失败，发送、接收数据失败或者处理数据出现错误，browser会触发onerror消息;

   ```javascript
   websocket.onerror = function(evt) { };
   ```

   ​	（3）当Browser接收到WebSocketServer发送过来的数据时，就会触发onmessage消息，参数evt中包含server传输过来的数据;

   ```javascript
   websocket.onmessage = function(evt) { };
   ```

   ​	（4）当Browser接收到WebSocketServer端发送的关闭连接请求时，就会触发onclose消息。

   ```javascript
   websocket.onclose = function(evt) { };
   ```

3. ##### 通信协议

   ​	WebSocket与TCP、HTTP的关系WebSocket与http协议一样都是基于TCP的，所以他们都是可靠的协议，Web开发者调用的WebSocket的send函数在browser的实现中最终都是通过TCP的系统接口进行传输的。

   ​       WebSocket和Http协议一样都属于应用层的协议，那么他们之间有没有什么关系呢?答案是肯定的，WebSocket在建立握手连接时，数据是通过http协议传输的，但是在建立连接之后，真正的数据传输阶段是不需要http协议参与的。

![img](http://images2015.cnblogs.com/blog/1021265/201609/1021265-20160921221912277-1586190277.png)

#### WebSocket通讯详细解读

​	从下图可以明显的看到，分三个阶段：

1. 打开握手

2. 数据传递

3. 关闭握手

   ![img](http://images2015.cnblogs.com/blog/1021265/201609/1021265-20160921222052856-1205398103.png)

   下图显示了WebSocket主要的三步 浏览器和 服务器端分别做了那些事情。

![img](http://images2015.cnblogs.com/blog/1021265/201609/1021265-20160921222119574-1417271389.png)



#### WebSocket的优点

​	a)、服务器与客户端之间交换的标头信息很小，大概只有2字节;

​	b)、客户端与服务器都可以主动传送数据给对方;

​	c)、不用频率创建TCP请求及销毁请求，减少网络带宽资源的占用，同时也节省服务器资源;



#### 建立连接的握手

​	当Web应用程序调用new WebSocket(url)接口时，Browser就开始了与地址为url的WebServer建立握手连接的过程。

1. Browser与WebSocket服务器通过TCP三次握手建立连接，如果这个建立连接失败，那么后面的过程就不会执行，Web应用程序将收到错误消息通知。

2. 在TCP建立连接成功后，Browser/UA通过http协议传送WebSocket支持的版本号，协议的字版本号，原始地址，主机地址等等一些列字段给服务器端。

3. WebSocket服务器收到Browser/UA发送来的握手请求后，如果数据包数据和格式正确，客户端和服务器端的协议版本号匹配等等，就接受本次握手连接，并给出相应的数据回复，同样回复的数据包也是采用http协议传输。

4. Browser收到服务器回复的数据包后，如果数据包内容、格式都没有问题的话，就表示本次连接成功，触发onopen消息，此时Web开发者就可以在此时通过send接口想服务器发送数据。否则，握手连接失败，Web应用程序会收到onerror消息，并且能知道连接失败的原因。

   这个握手很像HTTP，但是实际上却不是，它允许服务器以HTTP的方式解释一部分handshake的请求，然后切换为WebSocket

#### 数据传输

​	WebSocket协议中，数据以帧序列的形式传输。

​	考虑到数据安全性，客户端向服务器传输的数据帧必须进行掩码处理。服务器若接收到未经过掩码处理的数据帧，则必须主动关闭连接。

​	服务器向客户端传输的数据帧一定不能进行掩码处理。客户端若接收到经过掩码处理的数据帧，则必须主动关闭连接。

​	针对上情况，发现错误的一方可向对方发送close帧(状态码是1002，表示协议错误)，以关闭连接。

​	关闭WebSocket(握手)

![img](http://images2015.cnblogs.com/blog/1021265/201609/1021265-20160921222241856-1088460128.png)

