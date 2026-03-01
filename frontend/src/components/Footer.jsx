import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer({ darkMode }) {
  return (
    <footer className="flex flex-col items-center justify-center px-6 md:px-16 lg:px-48 py-6 bg-[#8657ff] dark:bg-[#8657ff] shadow-md transition-colors duration-300 text-center">
      <div className="flex flex-wrap justify-center gap-6 mb-4">
        <a
          href="https://www.facebook.com/profile.php?id=100076155342790&sk=about"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-300 transition-colors duration-300"
        >
          <Facebook className="w-6 h-6 text-white" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-300 transition-colors duration-300"
        >
          <Twitter className="w-6 h-6 text-white" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-300 transition-colors duration-300"
        >
          <Instagram className="w-6 h-6 text-white" />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-300 transition-colors duration-300"
        >
          <Linkedin className="w-6 h-6 text-white" />
        </a>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-xs md:text-sm text-white">
        <a href="/about" className="hover:text-purple-300 transition-colors duration-300" role="button">
          About
        </a>
        <a href="/contact" className="hover:text-purple-300 transition-colors duration-300" role="button">
          Contact
        </a>
        <a href="/privacy-policy" className="hover:text-purple-300 transition-colors duration-300" role="button">
          Privacy Policy
        </a>
        <a href="/terms-of-service" className="hover:text-purple-300 transition-colors duration-300" role="button">
          Terms of Service
        </a>
      </div>

      <p className="mt-4 text-xs text-white">
        © {new Date().getFullYear()} Cheebo. All rights reserved.
      </p>
    </footer>
  );
}
