import { Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";
var serviceAccount = {
	"type": "service_account",
	"project_id": "minutes-da91d",
	"private_key_id": "db54738799d550288a8f73251243281863af9069",
	"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCPgcQw9ZjwQhK8\nO2uKe06o4pNaF69L9Vtlhfn1vJGXHOMd/JtldtxIQB54FysI8ToO73dYzhjLSEJl\nRlr0K4wbCU7o1FY9ZDMHitkMBpZpvZfQbhRwvN9OrOmoX7mCECg81PQcWHuYpjeY\ncKoe1p6IcjTmhzibR8b1KEnHgGot0Ae4HJxHt4RHPaOwMtHdjlaG586FYVMl7jmn\nDlGu0jFLQTNT47i7rn9dAX2B54CVBYOefyUiOU1v903dtTStFEVyamTgGAI89sTQ\n6lhCcTG620/Btqwaqwdyf79I1VNjGFtKTLWMZa/yRWYhiQiPeMJ3LHOkYWmenagp\no8762fT9AgMBAAECggEAO68MIhKa212Xfiq2VL9o3QtynjcYhF5UdzpL1Zxp7q+o\nc6nCFWZkQjZMlcSI9OyiqWCFwezhWfZBCu7CWCeeWwY5h9L71QeNw5bHI13AA9VC\nxQBrRuH+e7Glcg3x0LqYiYhFyF4ydS+4EpHU5wN6pqPdBX16mPY2tHJfkPYC8u8h\nQAq3xVLhK4zqS8xLhyU6Pnv0O3hnNwdEYnk1duAiS8fBEjVN/aTBQiLbM+E2V5zp\n8QEi5wURTXleLj7d5WROXuUifpg4xFUQa9DxGp2VGsE/f72J8zAE95GHG0kgYref\nm3vCMrMm98viX0YI8gBvdkW02A730zut6/PY2uLvfwKBgQC/x19uomcz29KTScX1\ne4fILG/I8/L4P6cl+tw/+FjN1lwcvNc/0ltGE2z8nDZIe4Un2ZuS3nigrw6y4qql\nPxHtKHmIeE8QOvSTu64o6WfxfLpMObennVcQqfQQtZTgLkVrHmVVJqebbJTzKHBC\nf8ssdHnLpZZ9VKAcDTT+TNr6DwKBgQC/kC/YbLu+KMxTtl8Ks418elqKyKpoTFfs\nNEFvfS0BHtoZx3BUMpUWf+Fd1W9gmcTeqQt9Qxmj0jUhzPn7Sur0qJnEgmVXfs9K\n765zrjx5Z83EkgM80Ua4LuShMDQbY+XbFu6ik13lrvvTN/vF5YM9yE39K9DzAKpA\nKf9ZhJecMwKBgELveVWKBW9KODMEOr21gezR5apDyvfub46IAjupmIUvXjMBjjdO\nWmEZAp8gfqnJwu3nu68FSyD6OK0jA+BtJPqbd9+z7hSCHz848E6DOK5GlFdqhblQ\n50R/rRnv5qhgPgZnM4MG3NUYjtxXrubm56j6dlAn2WChGsjvqyFe/cbtAoGBAKfL\n5v0OkY1KM2CIeMvo52BH1JOInivp44IVa9P6s7ctjSHTnsNB43Hn5kLJOFxHlTjs\nnhHE+uqSsNPAtp+1ygUwwjBtf9OaUn1zYT4XOwWlNYqf05IsRmQDP2Up0hrD8I1u\nku15ZGBSXGdxvGpmVgWCNT40aTzSMk8t+mwxRpQdAoGAVC7eMa1MjyJqnfZxTzP6\nl3v3nUg17VfZmOxOpWIUNc35ZTx6bWz9o2dLz4KEtRYCNewvffGFDuotia01laOA\nssY8v8p89fgZ2XDRrn3S47cTV8zFgN4BgEUEDIwe0ehwUJsOUZgS3IqzZHlWmjLe\nIEmOv7ejgYT5jBgs9GqGBTY=\n-----END PRIVATE KEY-----\n",
	"client_email": "firebase-adminsdk-dgpvq@minutes-da91d.iam.gserviceaccount.com",
	"client_id": "111916367157445991395",
	"auth_uri": "https://accounts.google.com/o/oauth2/auth",
	"token_uri": "https://oauth2.googleapis.com/token",
	"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dgpvq%40minutes-da91d.iam.gserviceaccount.com"
  }

admin.initializeApp
({
	credential: admin.credential.cert(JSON.parse(JSON.stringify(serviceAccount))),
	databaseURL: "https://minutes-da91d.firebaseio.com"
});

const fcm = admin.messaging();

@Injectable()
export class FCMService
{
	async send(title: string, message: string, icon: string)
	{
		const payload: admin.messaging.MessagingPayload = 
		{			
			notification: 
			{
				title: title,
				body: message,
				clickAction: "FLUTTER_NOTIFICATION_CLICK",		
				collapseKey: "collapser",		
				image: icon
			}
		};

		fcm.sendToTopic("news", payload);
	}	
}