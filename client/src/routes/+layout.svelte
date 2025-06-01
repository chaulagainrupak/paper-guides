<script lang="ts">
  import "../app.css";
    import { onMount } from "svelte";

  let { children } = $props();

    onMount(() => {

    // Get dark mode setting from localStorage
    let darkmode = localStorage.getItem("darkmode");
    const themeSwitch = document.getElementById("theme-switch");

    function enableDarkMode() {
      document.body.classList.add("darkmode");
      localStorage.setItem("darkmode", "active");
    }

    function disableDarkMode() {
      document.body.classList.remove("darkmode");
      localStorage.setItem("darkmode", "deactive");
    }

    if (darkmode === "active") enableDarkMode();

    themeSwitch!.addEventListener("click", () => {
      darkmode = localStorage.getItem("darkmode");
      darkmode !== "active" ? enableDarkMode() : disableDarkMode();
    });
    })
</script>

<div>
  <script>

  </script>

  <nav class="bg-[var(--color-nav)] fixed top-0 w-full z-50 shadow-sm">
    <div class="flex justify-between items-center px-6 py-4 text-2xl font-bold">
      <a href="/" class="text-xl sm:text-2xl">
        Paper-<span class="text-[var(--blue-highlight)]">Guides</span>
      </a>

      <div class="flex gap-4 hidden xl:flex">
        <a href="/levels">Past Papers</a>
        <a href="/topicals">Topical Papers</a>
        <a href="/generator">Question Generator</a>
        <a href="/submit">Submit</a>
      </div>

      <div class="flex gap-2 hidden xl:flex">
        <a href="/stats" class="text-[var(--blue-highlight)]"> Statistics </a>
        <a href="/about" class="text-[var(--pink-highlight)]"> About </a>
        <a href="/login">Login</a>
      </div>

      <div class="xl:hidden relative">
        <input type="checkbox" id="hamburger" class="peer hidden" />
        <label for="hamburger" class="cursor-pointer text-3xl select-none">
          &#9776;
        </label>

        <div
          class="bg-[var(--color-nav)] absolute right-0 top-12 w-52 shadow-lg border rounded-lg p-4 flex flex-col gap-3 peer-checked:flex hidden"
        >
          <a href="/levels">Past Papers</a>
          <a href="/topicals">Topical Papers</a>
          <a href="/generator">Question Generator</a>
          <a href="/submit">Submit</a>
          <a href="/stats" class="text-[var(--blue-highlight)]"> Statistics </a>
          <a href="/about" class="text-[var(--pink-highlight)]"> About </a>
          <a href="/login">Login</a>
        </div>
      </div>
    </div>
  </nav>

  <button
    aria-label="theme-toggle"
    style="
                width: 60px;
                height: 60px;
                position: fixed;
                z-index: 999999;
                bottom: 50px;
                right: 50px;
                padding: 18px;
                border: none;
                border-radius: 50%;
                background-color: var(--blue-highlight);
                cursor: pointer;
                scale: 1.2;
            "
    id="theme-switch"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="currentColor"
    >
      <path
        d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"
      />
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="currentColor"
    >
      <path
        d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z"
      />
    </svg>
  </button>

  <style>
    #theme-switch svg:last-child {
      display: none;
    }

    .darkmode #theme-switch svg:first-child {
      display: none;
    }

    .darkmode #theme-switch svg:last-child {
      display: block;
    }
  </style>
</div>

{@render children()}
