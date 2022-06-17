import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ClientPage extends StatefulWidget {
  @override
  _ClientPageState createState() => _ClientPageState();
}

class _ClientPageState extends State<ClientPage> {
  @override
  void initState() {
    initSocket();
    super.initState();
  }

  @override
  void dispose() {
    return super.dispose();
  }

  @override
  void setState(VoidCallback fn) {
    if (this.mounted) {
      return super.setState(fn);
    }
  }

  late IO.Socket socket;

  void initSocket() {
    // var url = "http://10.0.2.2:3000/chat";
    var url = "http://10.0.2.2:5000";

    try {
      // Configure socket transports must be sepecified
      socket = IO.io(url, <String, dynamic>{
        'transports': ['websocket'],
        'autoConnect': false,
      });

      // Connect to websocket
      socket.connect();

      // Handle socket events
      socket.on('connect', (_) => print('connect: ${socket.id}'));
      // socket.on('location',  (_) => print('connect: ${socket.id}'));
      // socket.on('typing',  (_) => print('connect: ${socket.id}'));
      // socket.on('message', handleMessage);
      socket.on('disconnect', (_) => print('disconnect'));
      socket.on('fromServer', (_) => print(_));
    } catch (e) {
      log(e.toString());
    }
    // socket = IO.io(url, <String, dynamic>{
    //   'transports': ['websocket'],
    // });

    // // socket.emit('connect_on', 'Flutter Socket.IO, Success');
    // socket.connect();
    // // socket.emit("signin", widget.sourchat?.id ?? 'nulll_sourchat');
    // socket.onConnect((data) {
    //   log("Connected $data");
    //   socket.emit('connect_on', 'Flutter Socket.IO, Success');

    //   socket.on("coin", (msg) {
    //     print(msg);
    //   });
    // });
    // socket.on(
    //   'connect_on',
    //   (data) => print(data),
    // );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Socket Connection"),
      ),
      body: Container(
          alignment: Alignment.center,
          child: Center(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 25,
                  backgroundColor: const Color(0xFF128C7E),
                  child: IconButton(
                    icon: const Icon(
                      Icons.send,
                      color: Colors.white,
                    ),
                    onPressed: () {
                      print(socket.connected);
                      print('call-init');
                      socket.emit("coin", {'key': 'hai'});
                      print('call-end');
                    },
                  ),
                ),
                const Text(
                    "If you can see 'Flutter Socket.IO, Success' in console then you achived connection :)"),
              ],
            ),
          )),
    );
  }
}
