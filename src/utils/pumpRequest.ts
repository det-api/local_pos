import { client } from "../app";

const topic = "detpos/local_server/";
// message = "san kyi tr pr"
// export const pumpRequest = () => {
//   setInterval(() => {
//     for (let i = 1; i <= 32; i++) {
//       const message = `GET${i}`;

//       client.publish(topic, message);
//     }
//   }, 1000);
// };

export const pumpRequest = async () => {
  while (true) {
    for (let i = 1; i <= 32; i++) {
      const message = "GET" + i.toString();
      client.publish(topic, message); // Publish the message
      await new Promise((resolve) => setTimeout(resolve, 500)); // Sleep for 0.1 seconds
    }
  }
};
