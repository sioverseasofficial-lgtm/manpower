document.addEventListener('DOMContentLoaded', () => {
    const editorSection = document.getElementById('editor-section');
    const viewSection = document.getElementById('view-section');
    const form = document.getElementById('data-form');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photo-preview');
    const resultSection = document.getElementById('result-section');
    const generatedUrlInput = document.getElementById('generated-url');
    const qrcodeContainer = document.getElementById('qrcode');
    const copyBtn = document.getElementById('copy-btn');
    const openBtn = document.getElementById('open-btn');

    let compressedPhotoBase64 = '';

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Extremely aggressive compression for QR Code capacity
                    const MAX_WIDTH = 70;
                    const MAX_HEIGHT = 70;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }

                    canvas.width = width; canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    compressedPhotoBase64 = canvas.toDataURL('image/jpeg', 0.2);
                    
                    photoPreview.src = compressedPhotoBase64;
                    photoPreview.style.display = 'block';
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Use ultra-short keys to minimize URL length
        const data = {
            p: compressedPhotoBase64,
            n: document.getElementById('name').value,
            e1: document.getElementById('ec_no').value,
            e2: document.getElementById('ec_date').value,
            b1: document.getElementById('birth_date').value,
            b2: document.getElementById('blood_group').value,
            r: document.getElementById('referral_no').value,
            em: document.getElementById('employer').value,
            c: document.getElementById('country').value,
            p1: document.getElementById('passport_no').value,
            p2: document.getElementById('passport_issue_date').value,
            p3: document.getElementById('passport_expire_date').value,
            v1: document.getElementById('visa_no').value,
            v2: document.getElementById('visa_issue_date').value,
            v3: document.getElementById('visa_expire_date').value,
            r1: document.getElementById('ra_name').value,
            r2: document.getElementById('ra_license').value,
            r3: document.getElementById('ra_phone').value,
            bm1: document.getElementById('bmet_no').value,
            bm2: document.getElementById('bmet_gender').value,
            bm3: document.getElementById('bmet_nid').value,
            a1: document.getElementById('pa_house').value,
            a2: document.getElementById('pa_po').value,
            a3: document.getElementById('pa_ps').value,
            a4: document.getElementById('pa_upazila').value,
            a5: document.getElementById('pa_district').value,
            a6: document.getElementById('pa_division').value,
            ec1: document.getElementById('ec_name').value,
            ec2: document.getElementById('ec_relation').value,
            ec3: document.getElementById('ec_mobile').value,
            ec4: document.getElementById('ec_address').value,
        };

        const jsonString = JSON.stringify(data);
        const encodedData = LZString.compressToEncodedURIComponent(jsonString);
        
        const baseUrl = window.location.href.split('#')[0].split('?')[0];
        const finalUrl = `${baseUrl}?data=${encodedData}`;

        generatedUrlInput.value = finalUrl;
        openBtn.href = finalUrl;
        
        qrcodeContainer.innerHTML = '';
        try {
            new QRCode(qrcodeContainer, {
                text: finalUrl,
                width: 200,
                height: 200,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.L // Lowest error correction = highest data capacity
            });
        } catch (error) {
            console.error("QR Code Error:", error);
            qrcodeContainer.innerHTML = '<p style="color:red; font-size:12px; text-align:center;">Data too large for QR Code. Please use the link instead.</p>';
        }

        resultSection.style.display = 'block';
    });

    copyBtn.addEventListener('click', () => {
        generatedUrlInput.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    });

    function checkUrlData() {
        const url = window.location.href;
        let encodedData = '';
        
        if (url.includes('?data=')) {
            encodedData = url.split('?data=')[1];
        } else if (url.includes('#data=')) {
            encodedData = url.split('#data=')[1];
        }
        
        if (encodedData) {
            try {
                // Extract only valid LZString URI-safe base64 characters
                const match = encodedData.match(/^[A-Za-z0-9\+\-\$]+/);
                if (match) {
                    encodedData = match[0];
                }
                
                const jsonString = LZString.decompressFromEncodedURIComponent(encodedData);
                const data = JSON.parse(jsonString);
                populateView(data);
                editorSection.style.display = 'none';
                viewSection.style.display = 'block';
            } catch (error) {
                console.error("Failed to parse data", error);
                alert("Invalid or corrupted link data.");
            }
        } else {
            editorSection.style.display = 'block';
            viewSection.style.display = 'none';
        }
    }

    function populateView(data) {
        document.getElementById('view-photo').src = data.p || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        document.getElementById('view-name').textContent = data.n || '';
        document.getElementById('view-ec_no').textContent = data.e1 || '';
        document.getElementById('view-ec_date').textContent = data.e2 || '';
        
        document.getElementById('view-birth_date').textContent = data.b1 || '';
        document.getElementById('view-blood_group').textContent = data.b2 || '';
        document.getElementById('view-referral_no').textContent = data.r || '';
        document.getElementById('view-employer').textContent = data.em || '';
        document.getElementById('view-country').textContent = data.c || '';
        
        document.getElementById('view-passport_no').textContent = data.p1 || '';
        document.getElementById('view-passport_issue_date').textContent = data.p2 || '';
        document.getElementById('view-passport_expire_date').textContent = data.p3 || '';
        
        document.getElementById('view-visa_no').textContent = data.v1 || '';
        document.getElementById('view-visa_issue_date').textContent = data.v2 || '';
        document.getElementById('view-visa_expire_date').textContent = data.v3 || '';
        
        document.getElementById('view-ra_name').textContent = data.r1 || '';
        document.getElementById('view-ra_license').textContent = data.r2 || '';
        document.getElementById('view-ra_phone').textContent = data.r3 || '';
        
        document.getElementById('view-bmet_no').textContent = data.bm1 || '';
        document.getElementById('view-bmet_name').textContent = data.n || ''; 
        document.getElementById('view-bmet_birth_date').textContent = data.b1 || ''; 
        document.getElementById('view-bmet_gender').textContent = data.bm2 || '';
        document.getElementById('view-bmet_nid').textContent = data.bm3 || '';
        
        document.getElementById('view-pass_name').textContent = data.n || ''; 
        document.getElementById('view-pass_no_1').textContent = data.p1 || ''; 
        
        document.getElementById('view-pa_house').textContent = data.a1 || '';
        document.getElementById('view-pa_po').textContent = data.a2 || '';
        document.getElementById('view-pa_ps').textContent = data.a3 || '';
        document.getElementById('view-pa_upazila').textContent = data.a4 || '';
        document.getElementById('view-pa_district').textContent = data.a5 || '';
        document.getElementById('view-pa_division').textContent = data.a6 || '';
        
        document.getElementById('view-ec_name').textContent = data.ec1 || '';
        document.getElementById('view-ec_relation').textContent = data.ec2 || '';
        document.getElementById('view-ec_mobile').textContent = data.ec3 || '';
        document.getElementById('view-ec_address').textContent = data.ec4 || '';
    }

    window.addEventListener('hashchange', checkUrlData);
    window.addEventListener('popstate', checkUrlData);
    checkUrlData();
});
