import Link from "next/link";
import styles from "./footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <h3>Bahamas</h3>
          <p>
            Platforma łącząca ludzi z najlepszymi zajęciami dodatkowymi w ich okolicy. Dla dzieci,
            młodzieży i dorosłych.
          </p>
        </div>

        <div className={styles.column}>
          <h4>Zajęcia</h4>
          <ul>
            <li><Link href="/search?ageGroup=kids">Dla dzieci</Link></li>
            <li><Link href="/search?ageGroup=teens">Dla młodzieży</Link></li>
            <li><Link href="/search?ageGroup=adults">Dla dorosłych</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Dla szkół</h4>
          <ul>
            <li><Link href="/login">Dodaj swoją szkołę</Link></li>
            <li><Link href="/partner">Panel partnera</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Informacje</h4>
          <ul>
            <li><Link href="#">O nas</Link></li>
            <li><Link href="#">Kontakt</Link></li>
            <li><Link href="#">Polityka prywatności</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        &copy; {new Date().getFullYear()} Bahamas. Wszystkie prawa zastrzeżone.
      </div>
    </footer>
  );
}
