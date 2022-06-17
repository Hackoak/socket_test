import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class IndividualPage extends StatefulWidget {
  const IndividualPage({Key? key}) : super(key: key);

  @override
  _IndividualPageState createState() => _IndividualPageState();
}

class _IndividualPageState extends State<IndividualPage> {
  late IO.Socket socket;
  @override
  void initState() {
    super.initState();
    connect();
  }

  void connect() {
    // var url = "http://10.0.2.2:5000";
    var url = "http://10.0.2.2:3000/chat";
    socket = IO.io(
        url,
        IO.OptionBuilder()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .disableAutoConnect()
            .build());
    socket.connect();
    // socket.emit("signin", widget.sourchat?.id ?? 'nulll_sourchat');
    socket.onConnect((data) {
      log("Connected $data");
      socket.on("coin", (msg) {
        print(msg);
      });
    });
    print(socket.connected);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
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
            Text('')
          ],
        ),
      ),
    );
  }
}
