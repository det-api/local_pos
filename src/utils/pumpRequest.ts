import { client } from "../app";

const topic = "detpos/local_server/";

export const pumpRequest = async () => {
  while (true) {
    for (let i = 1; i <= 4; i++) {
      const message = "GET" + i.toString();
      client.publish(topic, message);

      const messagePromise = new Promise((resolve) => {
        client.on("message", (receivedTopic, receivedMessage) => {
          console.log(receivedTopic)
          if (receivedTopic === `detpos/device1/${i}`) {
            resolve(receivedMessage.toString());
          }
        });
      });

      const receivedMessage = await messagePromise;
      console.log(receivedMessage)
      
      await new Promise((resolve) => setTimeout(resolve, 100)); // Sleep for 0.1 seconds
    }
  }
};
