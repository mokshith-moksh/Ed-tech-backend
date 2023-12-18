import nodemailer from "nodemailer";

interface MAILARGTYPES {
  email: string;
  title: string;
  body: string;
}

const mailSender = async ({
  email,
  title,
  body,
}: MAILARGTYPES): Promise<any> => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST as string,
      auth: {
        user: process.env.MAIL_USER as string,
        pass: process.env.MAIL_PASS as string,
      },
      secure: false,
    });

    let info = await transporter.sendMail({
      from: `"Moksh | MokshHelp" <${process.env.MAIL_USER}>`, // sender address
      to: email, // list of receivers
      subject: title, // Subject line
      html: body, // html body
    });

    console.log(info.response);
    return info;
  } catch (error) {
    console.log(error);
    throw new Error("not able to send mail");
  }
};

export default mailSender;
