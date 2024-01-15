import styles from './About.module.css';

const About = () => {
  return (
    <div className={styles.divAboutPage}>
      <h1>About AutoNews360</h1>
      <p>Welcome to AutoNews360, pioneers in the digital news world.</p>

      <p>Founded in 2023 by Avner Mushnik, AutoNews360 aspires to be more than just a news site. We offer a different news reading experience unlike anything you've known before. Utilizing advanced technologies, we automatically collect news stories from across the web and present them to you in the most accessible and innovative way possible.</p>

      <p>But we don't stop there. AutoNews360 brings the news to life with animated avatar characters, who read the articles in automatically generated video clips. Our unique user experience allows you to receive news in the most modern and interesting way possible.</p>

      <p>As part of our ongoing development, the site is still in the testing and running phase, and we welcome any feedback or suggestions for improvement.</p>

      <p>We invite you to join us on this exciting journey and be part of the revolution in the world of news.</p>

      <p>For any questions, suggestions, or feedback, do not hesitate to contact us at: <a href="mailto:autonews360news@gmail.com">autonews360news@gmail.com</a>.</p>

      <p>Best regards,<br />
      The AutoNews360 Team</p>
    </div>
  );
}

export default About;
