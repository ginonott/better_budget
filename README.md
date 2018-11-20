# Open Budget

This is a side project to help track spending in a simple web UI. It's also a place where I can try new stuff out so its a bit of a playground.

# TODO Roadmap
There's a lot of stuff I'd like to do with this but who knows when / if I will 🤷🏻‍♂️

- [ ] Write tests
  - tests aren't *usually* fun to write and especially when you write tests at work. However, they would be really helpful for making some of the later TODOs happen
- [ ] Break up the redux reducer file into subfiles
  - It would just be nice
- [ ] Make a set of async functions in a dedicated file to describe each capability of the system that actions can use, compose, etc.
  - This would make actions more testable and the API more reusable.
  - It would probably look cleaner
- [ ] Convert to styled components and introduce a global theme
  - Styled components are cool and cleaner IMHO
  - A theme provider will allow for customizable themes (not that there is anything wrong with the current one 🙂)
- [ ] Split out firebase code so that another backend can be swapped in (relates to the "make a set of async funcs...)
- [ ] Have a listener to update transactions when the DB or API is called
- [ ] Make components to add / edit tags
- [ ] Make each component drag n drop so you can configure the view as you like
- [ ] View and Edit re-occuring transactions
- [ ] ability to reset password, remember me, etc