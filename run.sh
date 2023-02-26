# Create the markdown file
deno run --allow-read --allow-write --allow-net main.ts

# Generate PDF from it
pandoc -s CourseOverviews.md -o CourseOverviews.pdf