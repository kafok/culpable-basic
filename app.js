
let datasets = null
const sex = new Map()
const noSex = new Map()
const mapDatasets = [sex, noSex]
let voices

async function main() {
	datasets = await load()
	datasets[0].forEach(question => {
		if (!sex.has(question.kind))
			sex.set(question.kind, [])

		sex.get(question.kind).push(question.question)
	})

	datasets[1].forEach(question => {
		if (!noSex.has(question.rate))
			noSex.set(question.rate, [])

		noSex.get(question.rate).push(question.question)
	})

	$('#no-1').click(() => next(1, 0))
	$('#no-2').click(() => next(1, 1))
	$('#no-3').click(() => next(1, 2))

	$('#sex').click(() => next(0, 'T'))
	$('#male').click(() => next(0, 'H'))
	$('#female').click(() => next(0, 'M'))
	$('#hot').click(() => next(0, 'P'))
	$('#other').click(() => next(0, 'N'))

	$('#normales').click(() => next(1, null))
	$('#sexuales').click(() => next(0, null))
}

main()


function load() {
	return new Promise((resolve, reject) => {
		const urls = [
			fetch('data/sex.json'),
			fetch('data/no-sex.json')
		]
	
		Promise.all(urls)
			.then(dss => {
				const res = dss
					.map(ds => ds.status == 200 ? ds.json() : null)
					.filter(ds => ds != null)
	
				Promise.all(res)
					.then(list => {
						resolve(list)
					})
					.catch(e => {
						console.error(e)
						reject(e)
					})
			})
			.catch(e => {
				console.error(e)
				reject(e)
			})
	})
}

function next(sex, kind) {
	const mSex = { 'T': '', 'H': 'Solo chicos: ', 'M': 'Solo chicas: ', 'P': 'Solo sexo opuesto: ', 'N': 'Prohibido uno mismo: ' }
	const mSexH3 = { 'T': '', 'H': 'Chicos', 'M': 'Chicas', 'P': 'Picante', 'N': 'Otros' }
	const mSexH3Class = { 'T': 'main', 'H': 'male', 'M': 'female', 'P': 'hot', 'N': 'main' }

	let question = null

	if (kind == null) {
		const rnd = Math.ceil(Math.random()*datasets[sex].length) - 1
		question = datasets[sex][rnd].question
		kind = datasets[sex][rnd].kind
	} else {
		const rnd = Math.ceil(Math.random()*mapDatasets[sex].get(kind).length) - 1
		question = mapDatasets[sex].get(kind)[rnd]
	}

	// Voz
	const msg = new SpeechSynthesisUtterance()
	msg.voice = voices[Math.ceil(Math.random()*voices.length) - 1]
	msg.text = sex == 0 ? `${mSex[kind] + question}` : question
	msg.rate = 3

	speechSynthesis.speak(msg)

	// HTML
	$('.question h1,h3').remove()
	$('.question').append(`<h3 class="${mSexH3Class[kind]}">${sex == 0 ? mSexH3[kind] : ''}</h3>`)
	$('.question').append(`<h1>${question}</h1>`)
}

speechSynthesis.getVoices()
speechSynthesis.onvoiceschanged = () => {
	voices = speechSynthesis.getVoices().filter(v => v.localService && v.lang.startsWith('es'))
}