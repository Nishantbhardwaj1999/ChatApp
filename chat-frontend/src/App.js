import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    height: '100vh',
    padding: '20px',
  },
  messageContainer: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
  },
  messageBubble: {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '10px',
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    marginLeft: 'auto',
  },
  otherMessage: {
    backgroundColor: '#EAEAEA',
  },
});

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null); // State to hold the WebSocket instance
  const classes = useStyles();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      console.log('Connected to server');
      setSocket(ws); // Set the WebSocket instance after connection
    };

    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      newMessage.timestamp = new Date().toLocaleString(); // Add timestamp to the new message
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    ws.onclose = () => {
      console.log('Connection closed');
    };

    return () => {
      if (ws) {
        ws.close(); // Close WebSocket connection on component unmount
      }
    };
  }, []);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) { // Check if socket is open before sending message
      const newMessage = {
        sender: 'Me',
        content: messageInput,
      };
      socket.send(JSON.stringify(newMessage));
      setMessageInput('');
    } else {
      console.log('Socket connection not open');
    }
  };

  return (
    <Box className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">Chat Application</Typography>
        </Grid>
        <Grid item xs={12} className={classes.messageContainer}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${classes.messageBubble} ${message.sender === 'Me' ? classes.myMessage : classes.otherMessage}`}
              >
                <Typography variant="body1">
                  <strong>{message.sender}</strong> ({message.timestamp}): {message.content}
                </Typography>
              </div>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              label="Type a message"
              variant="outlined"
              fullWidth
            />
            <Button onClick={sendMessage} variant="contained" sx={{ marginLeft: '10px' }}>Send</Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;
