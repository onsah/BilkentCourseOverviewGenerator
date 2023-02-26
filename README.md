# Bilkent Course Overview Generator
Generates course overvies from the official Bilkent Syllabuses

## Setup courses
Create a file called `courses.json`. Configure courses to download similar to the example:
```json
{
    "CS": [
        "101",
        "102"
    ],
    "MATH": [
        "101",
        "201"
    ]
}
```

## Usage

### Linux

#### Setup
Prerequisites:
* [nix package manager](https://nixos.org/download.html)

#### Generate files
Create a nix shell by running: 
```sh
nix-shell
```

In the nix shell, run:
```
chmod +x run.sh
./run.sh
```

This will generate files `CourseOverview.md` and `CourseOverview.pdf`. You can use the one you wish.

### Windows (via Powershell) (Not tested)

#### Setup
Prerequisites:
* [deno](https://deno.land/manual@v1.31.1/getting_started/installation#download-and-install)

#### Generate Files
1. Open Powershell
2. Run
```
deno run --allow-read --allow-write --allow-net main.ts
```
This will generate `CourseOverviews.md` file. You can convert it to pdf manually by using a website like https://md2pdf.netlify.app.
