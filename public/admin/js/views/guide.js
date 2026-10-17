// The how-to guide for Shelly (brief section 15: "a simple admin interface and basic instructions").
import { h } from '../ui.js';

export const GUIDE = `
<p>Everything on the website can be changed here, without code. The pattern is always the same:
<strong>change something → Save → when you’re happy, press “Publish to website”</strong> (top right). The website updates
in a minute or two. Until you publish, visitors keep seeing the previous version, so you can work in peace.</p>

<h2>Swap the homepage photos</h2>
<ol><li>Pages &amp; text → Homepage.</li>
<li>Under “Opening photos”, remove a photo (×) and press “+ Add photos”. Choose from your uploads, the site’s photos, or “Upload new photos”.</li>
<li>Drag to reorder. Three tall (portrait) photos look best: on a computer they sit side by side; on a phone they fade one into the next.</li>
<li>Add a short description to each photo (it helps Google). Save → Publish.</li></ol>

<h2>Add or remove portfolio photos</h2>
<ol><li>Portfolio &amp; services → Edit next to the specialty.</li>
<li>Gallery → “+ Add photos” (you can upload straight from your computer — full-size JPEGs are fine, they’re resized automatically).</li>
<li>Drag to reorder. The first five make the big editorial spread at the top, so put your strongest images first.</li>
<li>× removes a photo from the gallery (it stays in your Photo library). Save → Publish.</li></ol>

<h2>Publish a Journal story</h2>
<ol><li>Journal → “Write a new story”.</li>
<li>Type the title and write (or paste) the story. Use <strong>H2 Heading</strong> for section titles, “Intro paragraph” for the first paragraph, and the photo buttons to add a photo, a wide photo or two side by side. A video can be added from YouTube or Vimeo.</li>
<li>On the right: choose a category, a cover photo, a short summary, and the Google title &amp; description (the preview shows how it may look in search results).</li>
<li>Press <strong>Save draft</strong> any time. <strong>Preview</strong> shows the finished look.</li>
<li>When ready: Publish. To schedule, set a future date and time first — then press “Publish to website” and the story appears on its date (the website checks for scheduled stories every hour).</li>
<li>With a client’s permission, real sessions make wonderful stories: the location, how the session felt, and a gallery at the end.</li></ol>

<h2>Update pricing and packages</h2>
<ol><li>Pricing → change any price, inclusion, add-on, retainer or travel note.</li>
<li>Save shows you exactly what changed and asks you to confirm. Then Publish.</li></ol>

<h2>Edit service descriptions</h2>
<p>Portfolio &amp; services → Edit: name, headline (wrap words in &lt;em&gt;…&lt;/em&gt; for the gold italic accent), introduction, what the experience includes, which package shows, the page’s mood, and the Google title and description.</p>

<h2>Update the About page, the Experience, FAQs and contact details</h2>
<p>Pages &amp; text → choose the tab. FAQs show on the Experience and Pricing pages. Contact &amp; business info is used in the header, footer and booking form — and the email there is where inquiries go.</p>

<h2>Manage reviews</h2>
<ol><li>Reviews → open a review to feature it (homepage carousel and About page), tag the topics it talks about (it then shows on those service pages), or hide it.</li>
<li>New Google review? “+ Add a review” and paste it exactly as written on Google.</li>
<li>Keep the star rating and review count in Settings → Website &amp; Google matching your Google profile (once the automatic Google connection is approved, this happens on its own).</li></ol>

<h2>Inquiries</h2>
<p>Every inquiry is emailed to you and saved under Inquiries. The client automatically gets a confirmation email. Open one to reply by email, set its status (Replied, Booked, Not booked, Archived) and keep private notes.</p>
<p><em>The very first inquiry sends a one-time “activate” email from FormSubmit to your inbox — click the link in it once so future inquiries reach you.</em></p>

<h2>Photo library</h2>
<p>All your uploads live here. Click one to add a description or delete it (deleting removes it everywhere it’s used, so be sure).</p>

<h2>Report / Request button (testing period)</h2>
<p>On the website, the “Report / Request” button at the top lets you note anything you’d like changed or anything that looks wrong, with a screenshot. Brad and Claude work through those notes. It disappears at launch.</p>

<h2 id="launch">Launch (Brad &amp; Claude)</h2>
<ol><li>Settings → Move Firebase: copy everything to Shelly’s own Firebase project and switch.</li>
<li>Settings → People: add Shelly (owner). Then switch sign-in on (AUTH_REQUIRED in admin/js/config.js and fireflyOpenForTesting() in the rules) and deploy.</li>
<li>Remove the Report / Request button, connect the domain, submit the sitemap in Search Console. The full list is in docs/launch-checklist.md.</li></ol>
`;

export function render(view) {
    view.replaceChildren(h('div.card.guide', { html: GUIDE }));
}
